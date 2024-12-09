const multer = require('multer');
const path = require('path');
const config = require('./env');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.UPLOAD_DIR)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.ALLOWED_FILE_TYPES.includes(ext.substring(1))) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(config.MAX_FILE_SIZE) * 1024 * 1024 // Convert MB to bytes
    }
});

module.exports = upload; 