require('dotenv').config();

const config = {
    // Server Configuration
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database Configuration
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || 'root',
    DB_NAME: process.env.DB_NAME || 'alpha_d',

    // Email Configuration
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: process.env.SMTP_PORT || 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,

    // Campaign Configuration
    MAX_EMAILS_PER_BATCH: process.env.MAX_EMAILS_PER_BATCH || 50,
    EMAIL_BATCH_INTERVAL: process.env.EMAIL_BATCH_INTERVAL || 1000, // milliseconds

    // File Upload Configuration
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '5mb',
    ALLOWED_FILE_TYPES: ['csv', 'xlsx', 'xls']
};

module.exports = config; 