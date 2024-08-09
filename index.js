const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const campaignRoutes = require('./routes/campaigns');
const authRoutes = require('./routes/auth');
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/campaigns', campaignRoutes);
app.use('/api/auth', authRoutes);

app.get('/download-template', (req, res) => {
    res.download(path.join(__dirname, 'public', 'template.csv'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
