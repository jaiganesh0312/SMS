const express = require("express");
const examController = require("../controllers/examController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { createExamValidator, addExamResultValidator } = require("../middlewares/validators");

const router = express.Router();

router.use(protect);

// Exam Management
router.post("/", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), createExamValidator, examController.createExam);
router.get("/", examController.getExams);

// Results Management
router.post("/results", restrictTo("TEACHER", "SCHOOL_ADMIN"), addExamResultValidator, examController.addExamResult);
router.put("/results/:id", restrictTo("TEACHER", "SCHOOL_ADMIN"), examController.updateExamResult);
router.get("/results", examController.getExamResults);
router.get("/student-results", examController.getStudentExamResults);
router.get("/report", examController.getStudentReportCard);
router.get("/report/download", examController.downloadReportCard);

module.exports = router;
