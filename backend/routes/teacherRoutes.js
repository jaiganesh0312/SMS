const express = require("express");
const teacherController = require("../controllers/teacherController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/my-class", restrictTo("TEACHER"), teacherController.getMyClass);
router.get("/my-students", restrictTo("TEACHER"), teacherController.getMyStudents);
router.get("/student/:studentId/id-card", restrictTo("TEACHER", "PARENT", "SCHOOL_ADMIN"), teacherController.getIDCardData);
router.get("/my-periods", restrictTo("TEACHER"), teacherController.getMyPeriods);
router.get("/my-class-timetable", restrictTo("TEACHER"), teacherController.getMyClassTimetable);

module.exports = router;
