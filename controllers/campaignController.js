const upload = multer({ dest: 'uploads/' });

const uploadCSV = async (req, res) => {
  try {
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const recipient of results) {
          await db.query('INSERT INTO email_recipients (CompanyID, Email, FirstName, LastName) VALUES (?, ?, ?, ?)', [
            req.body.CompanyID,
            recipient.Email,
            recipient.FirstName,
            recipient.LastName,
          ]);
        }
        res.status(200).json({ message: 'CSV file processed successfully' });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCampaigns,
  uploadCSV,
};
