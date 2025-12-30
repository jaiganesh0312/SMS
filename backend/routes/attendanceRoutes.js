const express = require("express");
const attendanceController = require("../controllers/attendanceController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { markAttendanceValidator } = require("../middlewares/validators");

const router = express.Router();

router.use(protect);

router.post("/mark", restrictTo("TEACHER", "SCHOOL_ADMIN"), markAttendanceValidator, attendanceController.markAttendance);
router.get("/", attendanceController.getAttendance);
router.get("/report", attendanceController.getAttendanceReport);
router.put("/:id", attendanceController.updateAttendance);

module.exports = router;
