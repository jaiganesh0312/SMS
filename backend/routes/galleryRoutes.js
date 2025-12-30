const express = require("express");
const galleryController = require("../controllers/galleryController");
const imageUpload = require("../middlewares/imageUploadMiddleware");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

// Create Gallery (Admin)
router.post("/", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), galleryController.createGallery);

// Add Images (Admin)
router.post("/:id/images", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), imageUpload.array("images", 10), galleryController.addImages);

// Delete Gallery (Admin)
router.delete("/:id", restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"), galleryController.deleteGallery);

// View Galleries (All)
router.get("/", galleryController.getAllGalleries);
router.get("/:id", galleryController.getGallery);

module.exports = router;
