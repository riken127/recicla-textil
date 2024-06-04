const multer = require("multer");
const path = require("path");
// Configure multer disk storage
const storage = multer.diskStorage({
    // Set destination directory for uploaded files
    destination: (req, file, cb) => {
        let destinationFolder;
        switch (req.body.entityType) {
            case 'donation':
                destinationFolder = path.join('uploads', 'donations', req.body.entityId, 'images');
                break;
            case 'benefactor':
                if (req.body.entitySubType === 'profile') {
                    destinationFolder = path.join('uploads', 'benefactors', req.body.entityId, 'profile');
                } else if (req.body.entitySubType === 'post') {
                    destinationFolder = path.join('uploads', 'benefactors', req.body.entityId, 'posts', req.body.postId);
                } else if (req.body.entitySubType === 'offer') {
                    destinationFolder = path.join('uploads', 'benefactors', req.body.entityId, 'offers');
                } else if (req.body.entitySubType === 'prize'){
                    destinationFolder = path.join('uploads', 'benefactors', req.body.entityId, 'prizes');
                }
                break;
            case 'user':
                destinationFolder = path.join('uploads', 'users', req.body.entityId);
                break;
            default:
                throw new Error('Unsupported entity type.');
        }
        cb(null, destinationFolder);
    },
    // Set filename for uploaded files
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use current timestamp + original filename
    }
});

// Create multer instance with configured storage
const upload = multer({
    storage: storage // Use configured disk storage
});

// Export multer instance for use in other modules
module.exports = upload;
