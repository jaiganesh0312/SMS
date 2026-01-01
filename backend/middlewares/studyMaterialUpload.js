const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Middleware for handling study material file uploads (videos, PDFs, PPTs)
 */
const createStudyMaterialUpload = () => {
    // Temp directory for video uploads (will be converted to HLS and deleted)
    const tempDir = path.join(__dirname, '../uploads/study-materials/temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, tempDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `material-${uniqueSuffix}${ext}`);
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedVideoTypes = /mp4|webm|mov|avi|mkv/;
        const allowedDocTypes = /pdf|ppt|pptx/;
        const ext = path.extname(file.originalname).toLowerCase().slice(1);
        const mimetype = file.mimetype;

        // Check video types
        if (allowedVideoTypes.test(ext) ||
            mimetype.startsWith('video/')) {
            req.fileType = 'VIDEO';
            cb(null, true);
        }
        // Check PDF
        else if (ext === 'pdf' || mimetype === 'application/pdf') {
            req.fileType = 'PDF';
            cb(null, true);
        }
        // Check PPT/PPTX
        else if (allowedDocTypes.test(ext) ||
            mimetype === 'application/vnd.ms-powerpoint' ||
            mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            req.fileType = 'PPT';
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only video (mp4, webm, mov, avi, mkv), PDF, and PPT/PPTX files are allowed.'));
        }
    };

    return multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 500 * 1024 * 1024 // 500MB max for videos
        }
    });
};

module.exports = createStudyMaterialUpload;
