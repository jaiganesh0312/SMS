const express = require("express");
const bulkUploadController = require("../controllers/bulkUploadController");
const upload = require("../middlewares/uploadMiddleware");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/students", upload.single("file"), restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), bulkUploadController.uploadStudentParent);
router.post("/attendance", upload.single("file"), restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), bulkUploadController.uploadAttendance);
router.post("/exams", upload.single("file"), restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), bulkUploadController.uploadExams);
router.post("/results", upload.single("file"), restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), bulkUploadController.uploadExamResults);
router.post("/library-sections", upload.single("file"), restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN", "LIBRARIAN"), bulkUploadController.uploadLibrarySections);
router.post("/books", upload.single("file"), restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN", "LIBRARIAN"), bulkUploadController.uploadBooks);

module.exports = router;
