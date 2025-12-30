const express = require("express");
const complaintController = require("../controllers/complaintController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

// Parent: Create Complaint
router.post(
    "/request",
    restrictTo("PARENT"),
    complaintController.createComplaint
);

// Parent: Get My Complaints
router.get(
    "/my-complaints",
    restrictTo("PARENT"),
    complaintController.getMyComplaints
);

// Admin/Teacher: Get All Complaints
router.get(
    "/",
    restrictTo("SCHOOL_ADMIN", "TEACHER", "SUPER_ADMIN"),
    complaintController.getAllComplaints
);

module.exports = router;
