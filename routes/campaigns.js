const express = require('express');
const { getCampaigns } = require('../controllers/campaignController');
const router = express.Router();

router.get('/', getCampaigns);

module.exports = router;
