const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploadMiddleware = require('../middlewares/fileUpload');

const upload = createUploadMiddleware('school');

router.use(protect); // All routes require login

router.get('/', schoolController.getSchoolDetails);

// Only Admin can upload logo
router.post('/upload-logo', restrictTo('SCHOOL_ADMIN', 'SUPER_ADMIN'), upload.single('logo'), schoolController.uploadLogo);

module.exports = router;
