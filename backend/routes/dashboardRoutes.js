const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middlewares/authMiddleware");

// School Admin Stats
router.get("/stats", protect, dashboardController.getSchoolStats);

// System Admin Stats
router.get("/system-stats", protect, dashboardController.getSystemStats);

// Get All Schools (for Super Admin)
router.get("/schools", protect, dashboardController.getSchools);

module.exports = router;
