const express = require('express');
const { getCampaigns, uploadCSV } = require('../controllers/campaignController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken'); 

router.get('/', getCampaigns);
router.post('/upload', upload.single('file'), uploadCSV);

module.exports = router;
