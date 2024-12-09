const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config/env');
const campaignRoutes = require('./routes/campaigns');
const authRoutes = require('./routes/auth');
const customersRoutes = require('./routes/customer');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/campaigns', campaignRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something broke!',
        error: err.message
    });
});

// Start server
app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
    console.log(`Environment: ${config.NODE_ENV}`);
});
