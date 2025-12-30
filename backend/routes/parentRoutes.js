const express = require("express");
const parentController = require("../controllers/parentController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

// Routes for Admin
router.post(
  "/register",
  restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN", "TEACHER"),
  parentController.createParent
);
router.get("/", restrictTo("SCHOOL_ADMIN"), parentController.getAllParents);

// Routes for Parents
router.get(
  "/children",
  restrictTo("PARENT"),
  parentController.getMyChildren
);

router.get(
  "/child/:studentId/dashboard",
  restrictTo("PARENT"),
  parentController.getChildDashboard
);

module.exports = router;
