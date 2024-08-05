const db = require('../config/db');

const getCampaigns = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM email_campaigns');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCampaigns,
};
