const express = require("express");
const staffController = require("../controllers/staffController");
const authController = require("../controllers/authController"); // Reuse registerStaff?
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/:id/offer-letter", staffController.generateOfferLetter);
router.get("/:id/joining-letter", staffController.generateJoiningLetter);
router.post("/accept-offer", staffController.acceptOffer);


router.use(restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"));
router.post("/", staffController.createStaff);
router.get("/", staffController.getAllStaff);
router.get("/:id", staffController.getStaffById);
router.patch("/:id", staffController.updateStaff);
router.delete("/:id", staffController.deleteStaff);


// Note: Creation is handled by authController.registerStaff, 
// but we could alias it here for consistency if needed.
// router.post("/", authController.registerStaff);

module.exports = router;
