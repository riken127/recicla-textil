const multer = require("multer");

// Configure multer disk storage
const storage = multer.diskStorage({
    // Set destination directory for uploaded files
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in 'uploads/' directory
    },
    // Set filename for uploaded files
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Use current timestamp + original filename
    }
});

// Create multer instance with configured storage
const upload = multer({
    storage: storage // Use configured disk storage
});

// Export multer instance for use in other modules
module.exports = upload;
