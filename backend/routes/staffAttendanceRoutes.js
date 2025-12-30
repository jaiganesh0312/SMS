const express = require("express");
const staffAttendanceController = require("../controllers/staffAttendanceController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"));

router.post("/mark", staffAttendanceController.markAttendance);
router.get("/", staffAttendanceController.getAttendance);
router.put("/:id", staffAttendanceController.updateAttendance);

module.exports = router;
