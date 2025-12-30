const express = require("express");
const transportController = require("../controllers/transportController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(protect); // Using authController.protect

// =====================
// BUSES
// =====================
// Bus Management
router
    .route("/buses")
    .post(restrictTo("SCHOOL_ADMIN"), transportController.createBus)
    .get(restrictTo("SCHOOL_ADMIN", "STAFF", "BUS_DRIVER", "PARENT"), transportController.getAllBuses);

router.get(
    "/buses/my-bus",
    restrictTo("BUS_DRIVER"),
    transportController.getDriverBus
);

router
    .route("/buses/:id")
    .get(restrictTo("SCHOOL_ADMIN", "STAFF", "BUS_DRIVER"), transportController.getBusById)
    .patch(restrictTo("SCHOOL_ADMIN"), transportController.updateBus)
    .delete(restrictTo("SCHOOL_ADMIN"), transportController.deleteBus);

// Route Management
router
    .route("/routes")
    .post(restrictTo("SCHOOL_ADMIN"), transportController.createRoute)
    .get(restrictTo("SCHOOL_ADMIN", "STAFF", "BUS_DRIVER"), transportController.getRoutes);

router
    .route("/routes/:id")
    .patch(restrictTo("SCHOOL_ADMIN"), transportController.updateRoute)
    .delete(restrictTo("SCHOOL_ADMIN"), transportController.deleteRoute);

// Trip Management - Drivers need access here
router
    .route("/trips/:busId/start")
    .post(restrictTo("SCHOOL_ADMIN", "STAFF", "BUS_DRIVER"), transportController.startTrip);

router
    .route("/trips/:id/end")
    .post(restrictTo("SCHOOL_ADMIN", "STAFF", "BUS_DRIVER"), transportController.endTrip);

router
    .route("/trips/history")
    .get(restrictTo("SCHOOL_ADMIN", "STAFF", "BUS_DRIVER"), transportController.getTripHistory);

// Location - Drivers update, Parents/Admin view
router
    .route("/location")
    .post(restrictTo("SCHOOL_ADMIN", "STAFF", "BUS_DRIVER"), transportController.updateLocation);

router.get(
    "/location/live",
    restrictTo("SCHOOL_ADMIN", "STAFF", "PARENT", "BUS_DRIVER"),
    transportController.getLiveLocation
);

router.get(
    "/location/history/:tripId",
    restrictTo("SCHOOL_ADMIN", "STAFF", "BUS_DRIVER"),
    transportController.getLocationHistory
);

// =====================
// STUDENT ASSIGNMENTS
// =====================
// Assignments
router
    .route("/assignments")
    .post(restrictTo("SCHOOL_ADMIN", "STAFF"), transportController.assignStudentToBus)
    .get(restrictTo("SCHOOL_ADMIN", "STAFF", "BUS_DRIVER"), transportController.getBusAssignments);

router.get("/assignments/my-bus", transportController.getAssignedBus);

router.delete(
    "/assignments/:studentId",
    restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"),
    transportController.removeStudentFromBus
);

module.exports = router;
