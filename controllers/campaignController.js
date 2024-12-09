const multer = require('multer'); // Import multer
const fs = require('fs'); // Import file system module
const csv = require('csv-parser'); // Import CSV parser module
const db = require('../config/db'); // Assuming you have a db.js file that exports a database connection
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');
const path = require('path');

// Configure multer to save files to the 'uploads' directory
const upload = multer({ dest: 'uploads/' });



// Controller to handle CSV uploads and database insertion
const uploadCSV = async (req, res) => {
  try {
    const results = [];

    // Read the uploaded file and parse it as CSV
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Insert each record from the CSV into the database
        for (const recipient of results) {
          await db.query('INSERT INTO email_recipients (CompanyID, Email, FirstName, LastName) VALUES (?, ?, ?, ?)', [
            req.body.CompanyID,
            recipient.Email,
            recipient.FirstName,
            recipient.LastName,
          ]);
        }

        // Respond with a success message
        res.status(200).json({ message: 'CSV file processed successfully' });
      });
  } catch (error) {
    // Handle any errors that occur during processing
    res.status(500).json({ error: error.message });
  }
};

// Example function to get campaigns (replace with actual logic)
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await db.query('SELECT * FROM campaigns WHERE CompanyID = ?', [req.body.CompanyID]);
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new campaign
const createCampaign = async (req, res) => {
    try {
        const { name, subject, body, scheduledTime } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO campaigns (name, subject, body, status, scheduled_time) VALUES (?, ?, ?, ?, ?)',
            [name, subject, body, scheduledTime ? 'scheduled' : 'draft', scheduledTime]
        );

        return res.status(200).json({
            success: true,
            message: 'Campaign created successfully',
            data: { campaignId: result.insertId }
        });
    } catch (error) {
        console.error('Error creating campaign:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating campaign',
            error: error.message
        });
    }
};

// Add recipients to campaign
const addRecipientsToCampaign = async (req, res) => {
    try {
        const { campaignId, customerIds } = req.body;
        
        const values = customerIds.map(customerId => [campaignId, customerId]);
        await db.query(
            'INSERT INTO campaign_recipients (campaign_id, customer_id) VALUES ?',
            [values]
        );

        return res.status(200).json({
            success: true,
            message: 'Recipients added successfully'
        });
    } catch (error) {
        console.error('Error adding recipients:', error);
        return res.status(500).json({
            success: false,
            message: 'Error adding recipients',
            error: error.message
        });
    }
};

// Send campaign emails
const sendCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        // Get campaign details
        const [[campaign]] = await db.query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Update campaign status
        await db.query('UPDATE campaigns SET status = ? WHERE id = ?', ['sending', campaignId]);

        // Get recipients
        const [recipients] = await db.query(`
            SELECT cr.id as recipient_id, c.email, c.firstName, c.lastName 
            FROM campaign_recipients cr 
            JOIN customers c ON cr.customer_id = c.id 
            WHERE cr.campaign_id = ? AND cr.status = 'pending'
        `, [campaignId]);

        // Send emails
        for (const recipient of recipients) {
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM,
                    to: recipient.email,
                    subject: campaign.subject,
                    html: campaign.body.replace('{firstName}', recipient.firstName)
                                    .replace('{lastName}', recipient.lastName),
                });

                // Update recipient status
                await db.query(
                    'UPDATE campaign_recipients SET status = ?, sent_at = NOW() WHERE id = ?',
                    ['sent', recipient.recipient_id]
                );
            } catch (error) {
                console.error(`Error sending to ${recipient.email}:`, error);
                await db.query(
                    'UPDATE campaign_recipients SET status = ? WHERE id = ?',
                    ['failed', recipient.recipient_id]
                );
            }
        }

        // Update campaign status to completed
        await db.query('UPDATE campaigns SET status = ? WHERE id = ?', ['completed', campaignId]);

        return res.status(200).json({
            success: true,
            message: 'Campaign sent successfully'
        });
    } catch (error) {
        console.error('Error sending campaign:', error);
        return res.status(500).json({
            success: false,
            message: 'Error sending campaign',
            error: error.message
        });
    }
};

// Get campaign statistics
const getCampaignStats = async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN status = 'opened' THEN 1 ELSE 0 END) as opened
            FROM campaign_recipients 
            WHERE campaign_id = ?
        `, [campaignId]);

        return res.status(200).json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        console.error('Error getting campaign stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Error getting campaign stats',
            error: error.message
        });
    }
};

// Export campaign data
const exportCampaignData = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { format } = req.query; // 'excel' or 'csv'

        // Get campaign details with recipient data
        const [campaignData] = await db.query(`
            SELECT 
                c.name as campaign_name,
                c.subject,
                c.status as campaign_status,
                cust.firstName,
                cust.lastName,
                cust.email,
                cr.status as delivery_status,
                cr.sent_at,
                cr.opened_at
            FROM campaigns c
            JOIN campaign_recipients cr ON c.id = cr.campaign_id
            JOIN customers cust ON cr.customer_id = cust.id
            WHERE c.id = ?
        `, [campaignId]);

        if (!campaignData.length) {
            return res.status(404).json({
                success: false,
                message: 'No data found for this campaign'
            });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Campaign Data');

        // Define columns
        worksheet.columns = [
            { header: 'Campaign Name', key: 'campaign_name', width: 20 },
            { header: 'Subject', key: 'subject', width: 30 },
            { header: 'Campaign Status', key: 'campaign_status', width: 15 },
            { header: 'First Name', key: 'firstName', width: 15 },
            { header: 'Last Name', key: 'lastName', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Delivery Status', key: 'delivery_status', width: 15 },
            { header: 'Sent At', key: 'sent_at', width: 20 },
            { header: 'Opened At', key: 'opened_at', width: 20 }
        ];

        // Add rows
        worksheet.addRows(campaignData);

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `campaign-export-${timestamp}`;
        
        if (format === 'csv') {
            // CSV Export
            const csvPath = path.join(__dirname, '..', 'exports', `${fileName}.csv`);
            await workbook.csv.writeFile(csvPath);
            
            res.download(csvPath, `${fileName}.csv`, (err) => {
                if (err) {
                    console.error('Download error:', err);
                }
                // Clean up file after download
                fs.unlink(csvPath, (unlinkErr) => {
                    if (unlinkErr) console.error('File cleanup error:', unlinkErr);
                });
            });
        } else {
            // Excel Export
            const excelPath = path.join(__dirname, '..', 'exports', `${fileName}.xlsx`);
            await workbook.xlsx.writeFile(excelPath);
            
            res.download(excelPath, `${fileName}.xlsx`, (err) => {
                if (err) {
                    console.error('Download error:', err);
                }
                // Clean up file after download
                fs.unlink(excelPath, (unlinkErr) => {
                    if (unlinkErr) console.error('File cleanup error:', unlinkErr);
                });
            });
        }
    } catch (error) {
        console.error('Error exporting campaign data:', error);
        return res.status(500).json({
            success: false,
            message: 'Error exporting campaign data',
            error: error.message
        });
    }
};

// Export campaign statistics
const exportCampaignStats = async (req, res) => {
    try {
        const { campaignId } = req.params;

        // Get campaign statistics
        const [[campaign]] = await db.query(`
            SELECT 
                c.name,
                c.subject,
                c.status,
                c.scheduled_time,
                COUNT(cr.id) as total_recipients,
                SUM(CASE WHEN cr.status = 'sent' THEN 1 ELSE 0 END) as sent_count,
                SUM(CASE WHEN cr.status = 'failed' THEN 1 ELSE 0 END) as failed_count,
                SUM(CASE WHEN cr.status = 'opened' THEN 1 ELSE 0 END) as opened_count,
                MIN(cr.sent_at) as first_sent,
                MAX(cr.sent_at) as last_sent
            FROM campaigns c
            LEFT JOIN campaign_recipients cr ON c.id = cr.campaign_id
            WHERE c.id = ?
            GROUP BY c.id
        `, [campaignId]);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Campaign Statistics');

        // Add campaign overview
        worksheet.addRow(['Campaign Overview']);
        worksheet.addRow(['Name', campaign.name]);
        worksheet.addRow(['Subject', campaign.subject]);
        worksheet.addRow(['Status', campaign.status]);
        worksheet.addRow(['Scheduled Time', campaign.scheduled_time]);
        worksheet.addRow([]);

        // Add statistics
        worksheet.addRow(['Statistics']);
        worksheet.addRow(['Total Recipients', campaign.total_recipients]);
        worksheet.addRow(['Sent', campaign.sent_count]);
        worksheet.addRow(['Failed', campaign.failed_count]);
        worksheet.addRow(['Opened', campaign.opened_count]);
        worksheet.addRow(['First Sent', campaign.first_sent]);
        worksheet.addRow(['Last Sent', campaign.last_sent]);
        
        // Style the worksheet
        worksheet.getColumn(1).width = 20;
        worksheet.getColumn(2).width = 30;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `campaign-stats-${timestamp}.xlsx`;
        const filePath = path.join(__dirname, '..', 'exports', fileName);

        await workbook.xlsx.writeFile(filePath);

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            // Clean up file after download
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('File cleanup error:', unlinkErr);
            });
        });
    } catch (error) {
        console.error('Error exporting campaign statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error exporting campaign statistics',
            error: error.message
        });
    }
};

// Export the controller functions
module.exports = {
  getCampaigns,
  uploadCSV,
  createCampaign,
  addRecipientsToCampaign,
  sendCampaign,
  getCampaignStats,
  exportCampaignData,
  exportCampaignStats
};

// In your routes file, you would use the `uploadCSV` function like this:
// router.post('/upload-csv', upload.single('file'), campaignController.uploadCSV);
