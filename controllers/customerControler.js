const db = require('../config/db');

const getData = (tableName, columns) => {
    return new Promise((resolve, reject) => {
        try {
            let query;
            
            if (columns && columns.length > 0) {
                const columnsList = columns.join(', ');
                query = `SELECT ${columnsList} FROM ??`;
            } else {
                query = `SELECT * FROM ??`;
            }

            db.query(query, [tableName], (err, rows) => {
                if (err) {
                    console.error('Error fetching data from the table:', err);
                    return reject({
                        success: false,
                        message: 'Error fetching data',
                        error: err.message
                    });
                }
                return resolve({
                    success: true,
                    data: rows
                });
            });
        } catch (error) {
            console.error('Server error:', error);
            return reject({
                success: false,
                message: 'Server error occurred',
                error: error.message
            });
        }
    });
};

const addCustomerData = (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body;
        const query = 'INSERT INTO customers (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)';
        
        db.query(query, [firstName, lastName, email, phone], (err, result) => {
            console.log("hihihhi", result, err);
            
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Error adding customer',
                    error: err.message 
                });
            }
        });
        return res.status(200).json({ 
            success: true,
            message: 'Customer added successfully',
            data: result 
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Server error occurred',
            error: error.message 
        });
    }
};

const addCustomerCsv = (req, res) => {
    const customers = req.body.customers;
    const query = 'INSERT INTO customers (firstName, lastName, email, phone) VALUES ?';
    const values = customers.map(c => [c.firstName, c.lastName, c.email, c.phone]);
    db.query(query, [values], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error uploading customers from CSV' });
        }
        res.status(200).json({ message: 'CSV uploaded successfully' });
    });
}

const getCustomers = async (req, res) => {    
    try {
        const result = await getData('customers', []);
        if (!result.success) {
            return res.status(500).json(result);
        }
        return res.status(200).json({
            success: true,
            message: 'Customers fetched successfully',
            data: result.data
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message || error
        });
    }
};


module.exports = {addCustomerData,getCustomers,addCustomerCsv};