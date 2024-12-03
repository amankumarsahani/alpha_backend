const db = require('../config/db');

const getData = async (tableName, columns) => {
    try {
        let query;

        if (columns && columns.length > 0) {
            const columnsList = columns.join(', ');  // Join columns array into a comma-separated string
            query = `SELECT ${columnsList} FROM ??`;
        } else {
            query = `SELECT * FROM ??`;  // Fetch all columns if columns array is empty or not provided
        }
        // Execute the query using parameterized table name (to avoid SQL injection)
        const [rows] = await db.promise().query(query, [tableName]);

        return rows; // Return the result rows from the query
    } catch (err) {
        console.error('Error fetching data from the table:', err);
        throw new Error('Error fetching data');
    }
};

const addCustomerData = (req,res)=>{
    const { firstName, lastName, email, phone } = req.body;
    const query = 'INSERT INTO customers (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)';
    db.query(query, [firstName, lastName, email, phone], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding customer' });
        }
        res.status(200).json({ message: 'Customer added successfully' });
    });
}

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
        const customers = await getData('customers', []);        
        res.status(200).json(customers);
    } catch (err) {
        console.error('Error fetching customers', err);
        res.status(500).json({ message: 'Error fetching customers' });
    }
};


module.exports = {addCustomerData,getCustomers,addCustomerCsv};