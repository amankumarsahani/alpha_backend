const express = require('express');
const { addCustomerCsv, getCustomers, addCustomerData } = require('../controllers/customerControler');
const router = express.Router();

router.post('/addcustomercsv', addCustomerCsv);
router.get('/', getCustomers);
router.post('/addcustomers', addCustomerData);

module.exports = router;
