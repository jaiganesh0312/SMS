const express = require("express");
const leaveController = require("../controllers/leaveController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect); // All routes require login

// Applicant Routes
router.post("/apply", leaveController.applyLeave);
router.get("/my-leaves", leaveController.getMyLeaves);

// Admin Routes (Approve/Reject)
router.get(
    "/",
    restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"),
    leaveController.getAllLeaves
);

router.patch(
    "/:id/status",
    restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"),
    leaveController.updateLeaveStatus
);

module.exports = router;
