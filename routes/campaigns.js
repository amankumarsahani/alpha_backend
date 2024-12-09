const express = require('express');
const router = express.Router();
const { 
    createCampaign, 
    addRecipientsToCampaign, 
    sendCampaign, 
    getCampaignStats,
    exportCampaignData,
    exportCampaignStats
} = require('../controllers/campaignController');

router.post('/create', createCampaign);
router.post('/recipients', addRecipientsToCampaign);
router.post('/send/:campaignId', sendCampaign);
router.get('/stats/:campaignId', getCampaignStats);

// Export routes
router.get('/export/:campaignId', exportCampaignData);
router.get('/export-stats/:campaignId', exportCampaignStats);

module.exports = router;
