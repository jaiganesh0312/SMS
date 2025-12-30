const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploadMiddleware = (subfolder) => {
    const uploadDir = path.join(__dirname, `../uploads/${subfolder}`);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `${subfolder}-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Error: Only images (jpeg, jpg, png, webp) are allowed!'));
        }
    };

    return multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
    });
};

module.exports = createUploadMiddleware;
