const db = require('../config/db');

const getData = async (tableName, columns) => {
    try {
        let query;
        
        if (columns && columns.length > 0) {
            const columnsList = columns.join(', ');
            query = `SELECT ${columnsList} FROM \`${tableName}\``;
        } else {
            query = `SELECT * FROM \`${tableName}\``;
        }

        console.log("queryquery", query);
        
        const [rows] = await db.query(query);
        
        return {
            success: true,
            data: rows
        };
        
    } catch (error) {
        console.error('Server error:', error);
        return {
            success: false,
            message: 'Server error occurred',
            error: error.message
        };
    }
};

const addCustomerData = async (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body;
        const query = 'INSERT INTO customers (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)';
        
        const [result] = await db.query(query, [firstName, lastName, email, phone]);
        
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

const addCustomerCsv = async (req, res) => {
    try {
        const customers = req.body.customers;
        const query = 'INSERT INTO customers (firstName, lastName, email, phone) VALUES ?';
        const values = customers.map(c => [c.firstName, c.lastName, c.email, c.phone]);
        
        const [result] = await db.query(query, [values]);
        
        return res.status(200).json({ 
            success: true,
            message: 'CSV uploaded successfully',
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

const getCustomers = async (req, res) => {    
    try {
        console.log("hi");
        
        const result = await getData('customers', ['id', 'firstName', 'lastName', 'email', 'phone']);
        console.log("resultresult", result);
        
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