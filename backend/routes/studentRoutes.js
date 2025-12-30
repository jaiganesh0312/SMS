const express = require("express");
const studentController = require("../controllers/studentController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/:id/id-card", studentController.generateIDCard);
router.use(restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER", "LIBRARIAN"));

const createUploadMiddleware = require('../middlewares/fileUpload');
const upload = createUploadMiddleware('students');

router.post("/", studentController.createStudent);
router.patch("/:id", studentController.updateStudent);
router.post("/bulk-update", studentController.bulkUpdateStudents);
router.get("/", studentController.getAllStudents);

// Profile Picture
router.post("/:id/profile-picture", upload.single('profilePicture'), studentController.uploadProfilePicture);

// ID Card

module.exports = router;
