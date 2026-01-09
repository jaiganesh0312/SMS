const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const createStudyMaterialUpload = require("../middlewares/studyMaterialUpload");
const studyMaterialController = require("../controllers/studyMaterialController");

const upload = createStudyMaterialUpload();

// =====================
// STREAMING ROUTES (Unprotected by middleware, handles its own token auth)
// =====================

// Stream HLS files (token-based auth, no JWT header needed)
router.get("/hls/:token/:filename", studyMaterialController.streamHLS);

// All routes below require authentication
router.use(protect);

// =====================
// SECTION ROUTES
// =====================

// Create section (Teachers and Admins only)
router.post(
    "/sections",
    restrictTo("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"),
    studyMaterialController.createSection
);

// Get all sections (filter by class/subject)
router.get("/sections", studyMaterialController.getAllSections);

// Get section by ID with materials
router.get("/sections/:id", studyMaterialController.getSectionById);

// Update section
router.put(
    "/sections/:id",
    restrictTo("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"),
    studyMaterialController.updateSection
);

// Delete section
router.delete(
    "/sections/:id",
    restrictTo("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"),
    studyMaterialController.deleteSection
);

// Toggle section publish status
router.patch(
    "/sections/:id/publish",
    restrictTo("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"),
    studyMaterialController.toggleSectionPublish
);

// =====================
// MATERIAL ROUTES
// =====================

// Upload material to section
router.post(
    "/sections/:sectionId/materials",
    restrictTo("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"),
    upload.single("file"),
    studyMaterialController.uploadMaterial
);

// Get material by ID
router.get("/materials/:id", studyMaterialController.getMaterialById);

// Update material
router.put(
    "/materials/:id",
    restrictTo("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"),
    studyMaterialController.updateMaterial
);

// Delete material
router.delete(
    "/materials/:id",
    restrictTo("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"),
    studyMaterialController.deleteMaterial
);

// Toggle material publish status
router.patch(
    "/materials/:id/publish",
    restrictTo("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"),
    studyMaterialController.toggleMaterialPublish
);

// =====================
// STREAMING ROUTES
// =====================

// Get stream token for video (requires auth)
router.get("/materials/:id/stream", studyMaterialController.getStreamToken);



// Download document (PDF/PPT)
router.get("/materials/:id/download", studyMaterialController.downloadDocument);

module.exports = router;
