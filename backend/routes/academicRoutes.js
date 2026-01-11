const express = require("express");
const academicController = require("../controllers/academicController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { createClassValidator, createSectionValidator, createSubjectValidator, createTimetableValidator } = require("../middlewares/validators");

const router = express.Router();

router.use(protect); // All routes require login

// Classes
router.post("/classes", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), createClassValidator, academicController.createClass);
router.get("/classes/standards", academicController.getStandards);
router.get("/classes/standards/:standard/divisions", academicController.getDivisions);
router.post("/sections", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), createSectionValidator, academicController.createSection);
router.get("/teachers", academicController.getTeachers); // For dropdowns
router.patch("/sections/:sectionId/teacher", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), academicController.assignClassTeacher);
router.get("/classes", academicController.getAllClasses);
router.get("/sections", academicController.getAllSections);

// Subjects
router.post("/subjects", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), createSubjectValidator, academicController.createSubject);
router.get("/subjects", academicController.getAllSubjects);

// Timetable
router.post("/timetable/daily", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), academicController.createDailyTimetable);
router.post("/timetable", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), createTimetableValidator, academicController.createTimetableEntry);
router.get("/timetable", academicController.getTimetable);

module.exports = router;
