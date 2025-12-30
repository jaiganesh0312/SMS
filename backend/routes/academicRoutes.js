const express = require("express");
const academicController = require("../controllers/academicController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { createClassValidator, createSubjectValidator, createTimetableValidator } = require("../middlewares/validators");

const router = express.Router();

router.use(protect); // All routes require login

// Classes
router.post("/classes", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), createClassValidator, academicController.createClass);
router.get("/classes/standards", academicController.getStandards);
router.get("/classes/standards/:standard/divisions", academicController.getDivisions);
router.get("/teachers", academicController.getTeachers); // For dropdowns
router.patch("/classes/:classId/teacher", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), academicController.assignClassTeacher);
router.get("/classes", academicController.getAllClasses);

// Subjects
router.post("/subjects", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), createSubjectValidator, academicController.createSubject);
router.get("/subjects", academicController.getAllSubjects);

// Timetable
router.post("/timetable/daily", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), academicController.createDailyTimetable);
router.post("/timetable", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), createTimetableValidator, academicController.createTimetableEntry);
router.get("/timetable", academicController.getTimetable);

module.exports = router;
