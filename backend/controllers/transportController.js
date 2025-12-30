const {
    Bus,
    BusRoute,
    BusTrip,
    BusLocation,
    StudentBusAssignment,
    Student,
    User,
    Parent,
} = require("../models");
const { Op } = require("sequelize");
const { getIO } = require("../config/socketServer");

// =====================
// BUS CRUD
// =====================

const createBus = async (req, res) => {
    try {
        const { busNumber, registrationNumber, driverId, deviceId, capacity } = req.body;
        const schoolId = req.user.schoolId;

        const existing = await Bus.findOne({
            where: {
                schoolId,
                [Op.or]: [{ busNumber }, { registrationNumber }],
            },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Bus with this number or registration already exists",
            });
        }

        const bus = await Bus.create({
            schoolId,
            busNumber,
            registrationNumber,
            driverId,
            deviceId,
            capacity: capacity || 40,
        });

        res.status(201).json({
            success: true,
            message: "Bus created successfully",
            data: bus,
        });
    } catch (error) {
        console.error("createBus error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create bus",
            error: error.message,
        });
    }
};

const getAllBuses = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { isActive } = req.query;

        const where = { schoolId };
        if (isActive !== undefined) {
            where.isActive = isActive === "true";
        }

        const buses = await Bus.findAll({
            where,
            include: [
                {
                    model: User,
                    as: "driver",
                    attributes: ["id", "name", "email", "phone"],
                },
            ],
            order: [["busNumber", "ASC"]],
        });

        res.json({
            success: true,
            data: buses,
        });
    } catch (error) {
        console.error("getAllBuses error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch buses",
            error: error.message,
        });
    }
};

const getBusById = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const bus = await Bus.findOne({
            where: { id, schoolId },
            include: [
                {
                    model: User,
                    as: "driver",
                    attributes: ["id", "name", "email", "phone"],
                },
                {
                    model: BusRoute,
                    include: [],
                },
            ],
        });

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus not found",
            });
        }

        res.json({
            success: true,
            data: bus,
        });
    } catch (error) {
        console.error("getBusById error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bus",
            error: error.message,
        });
    }
};

const updateBus = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;
        const { busNumber, registrationNumber, driverId, deviceId, capacity, isActive } = req.body;

        const bus = await Bus.findOne({ where: { id, schoolId } });

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus not found",
            });
        }

        // Check for duplicates if updating number/registration
        if (busNumber && busNumber !== bus.busNumber) {
            const exists = await Bus.findOne({
                where: { schoolId, busNumber, id: { [Op.ne]: id } },
            });
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: "Bus number already in use",
                });
            }
        }

        await bus.update({
            busNumber: busNumber || bus.busNumber,
            registrationNumber: registrationNumber || bus.registrationNumber,
            driverId: driverId !== undefined ? driverId : bus.driverId,
            deviceId: deviceId !== undefined ? deviceId : bus.deviceId,
            capacity: capacity || bus.capacity,
            isActive: isActive !== undefined ? isActive : bus.isActive,
        });

        res.json({
            success: true,
            message: "Bus updated successfully",
            data: bus,
        });
    } catch (error) {
        console.error("updateBus error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update bus",
            error: error.message,
        });
    }
};

const deleteBus = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const bus = await Bus.findOne({ where: { id, schoolId } });

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus not found",
            });
        }

        await bus.destroy(); // Soft delete (paranoid)

        res.json({
            success: true,
            message: "Bus deleted successfully",
        });
    } catch (error) {
        console.error("deleteBus error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete bus",
            error: error.message,
        });
    }
};

// =====================
// ROUTES CRUD
// =====================

const createRoute = async (req, res) => {
    try {
        const { busId, routeName, routeType, stops } = req.body;
        const schoolId = req.user.schoolId;

        // Verify bus belongs to school
        const bus = await Bus.findOne({ where: { id: busId, schoolId } });
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus not found",
            });
        }

        const route = await BusRoute.create({
            schoolId,
            busId,
            routeName,
            routeType: routeType || "BOTH",
            stops: stops || [],
        });

        res.status(201).json({
            success: true,
            message: "Route created successfully",
            data: route,
        });
    } catch (error) {
        console.error("createRoute error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create route",
            error: error.message,
        });
    }
};

const getRoutes = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { busId } = req.query;

        const where = { schoolId };
        if (busId) {
            where.busId = busId;
        }

        const routes = await BusRoute.findAll({
            where,
            include: [
                {
                    model: Bus,
                    attributes: ["id", "busNumber"],
                },
            ],
            order: [["routeName", "ASC"]],
        });

        res.json({
            success: true,
            data: routes,
        });
    } catch (error) {
        console.error("getRoutes error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch routes",
            error: error.message,
        });
    }
};

const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;
        const { routeName, routeType, stops, isActive } = req.body;

        const route = await BusRoute.findOne({ where: { id, schoolId } });

        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found",
            });
        }

        await route.update({
            routeName: routeName || route.routeName,
            routeType: routeType || route.routeType,
            stops: stops !== undefined ? stops : route.stops,
            isActive: isActive !== undefined ? isActive : route.isActive,
        });

        res.json({
            success: true,
            message: "Route updated successfully",
            data: route,
        });
    } catch (error) {
        console.error("updateRoute error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update route",
            error: error.message,
        });
    }
};

const deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        const route = await BusRoute.findOne({ where: { id, schoolId } });

        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found",
            });
        }

        await route.destroy();

        res.json({
            success: true,
            message: "Route deleted successfully",
        });
    } catch (error) {
        console.error("deleteRoute error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete route",
            error: error.message,
        });
    }
};

// =====================
// TRIPS
// =====================

const startTrip = async (req, res) => {
    try {
        const { busId } = req.params;
        const { routeId, tripType } = req.body;
        const schoolId = req.user.schoolId;

        // Verify bus
        const bus = await Bus.findOne({ where: { id: busId, schoolId } });
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus not found",
            });
        }

        // Check if there's already an in-progress trip
        const activeTrip = await BusTrip.findOne({
            where: { busId, status: "IN_PROGRESS" },
        });

        if (activeTrip) {
            return res.status(400).json({
                success: false,
                message: "Bus already has an active trip",
                data: activeTrip,
            });
        }

        const trip = await BusTrip.create({
            schoolId,
            busId,
            routeId: routeId || null,
            tripType: tripType || "MORNING",
            status: "IN_PROGRESS",
            startTime: new Date(),
        });

        // Emit socket event for trip start
        try {
            const io = getIO();
            io.to(`bus:${busId}`).emit("bus:trip:start", { tripId: trip.id, busId });
            io.to(`school:${schoolId}:transport`).emit("bus:trip:start", { tripId: trip.id, busId });
        } catch (socketError) {
            console.log("Socket emit skipped:", socketError.message);
        }

        res.status(201).json({
            success: true,
            message: "Trip started",
            data: trip,
        });
    } catch (error) {
        console.error("startTrip error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to start trip",
            error: error.message,
        });
    }
};

const endTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const schoolId = req.user.schoolId;
        const { notes } = req.body;

        const trip = await BusTrip.findOne({ where: { id: tripId, schoolId } });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found",
            });
        }

        if (trip.status !== "IN_PROGRESS") {
            return res.status(400).json({
                success: false,
                message: "Trip is not in progress",
            });
        }

        await trip.update({
            status: "COMPLETED",
            endTime: new Date(),
            notes: notes || trip.notes,
        });

        // Emit socket event for trip end
        try {
            const io = getIO();
            io.to(`bus:${trip.busId}`).emit("bus:trip:end", { tripId, busId: trip.busId });
            io.to(`school:${schoolId}:transport`).emit("bus:trip:end", { tripId, busId: trip.busId });
        } catch (socketError) {
            console.log("Socket emit skipped:", socketError.message);
        }

        res.json({
            success: true,
            message: "Trip ended",
            data: trip,
        });
    } catch (error) {
        console.error("endTrip error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to end trip",
            error: error.message,
        });
    }
};

const getTripHistory = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { busId, date, status, limit = 50 } = req.query;

        const where = { schoolId };

        if (busId) {
            where.busId = busId;
        }

        if (status) {
            where.status = status;
        }

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            where.startTime = {
                [Op.between]: [startOfDay, endOfDay],
            };
        }

        const trips = await BusTrip.findAll({
            where,
            include: [
                {
                    model: Bus,
                    attributes: ["id", "busNumber"],
                },
                {
                    model: BusRoute,
                    attributes: ["id", "routeName"],
                },
            ],
            order: [["startTime", "DESC"]],
            limit: parseInt(limit),
        });

        res.json({
            success: true,
            data: trips,
        });
    } catch (error) {
        console.error("getTripHistory error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch trip history",
            error: error.message,
        });
    }
};

// =====================
// LOCATION
// =====================

const updateLocation = async (req, res) => {
    try {
        const { busId, lat, lng, speed, heading, accuracy } = req.body;
        const schoolId = req.user.schoolId;

        // Validate bus
        const bus = await Bus.findOne({ where: { id: busId, schoolId } });
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus not found",
            });
        }

        // Get active trip if any
        const activeTrip = await BusTrip.findOne({
            where: { busId, status: "IN_PROGRESS" },
        });

        // Deduplicate - check last location timestamp
        const lastLocation = await BusLocation.findOne({
            where: { busId },
            order: [["timestamp", "DESC"]],
        });

        if (lastLocation) {
            const diff = Date.now() - new Date(lastLocation.timestamp).getTime();
            if (diff < 5000) {
                // Ignore updates within 5 seconds
                return res.json({
                    success: true,
                    message: "Location update skipped (too soon)",
                    data: lastLocation,
                });
            }
        }

        // Save location
        const location = await BusLocation.create({
            busId,
            tripId: activeTrip?.id || null,
            lat,
            lng,
            speed: speed || null,
            heading: heading || null,
            accuracy: accuracy || null,
            timestamp: new Date(),
        });

        // Emit socket event
        try {
            const io = getIO();
            const locationData = {
                busId,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                speed,
                heading,
                timestamp: location.timestamp,
            };

            io.to(`bus:${busId}`).emit("bus:location:receive", locationData);
            io.to(`school:${schoolId}:transport`).emit("bus:location:receive", locationData);
        } catch (socketError) {
            console.log("Socket emit skipped:", socketError.message);
        }

        res.json({
            success: true,
            message: "Location updated",
            data: location,
        });
    } catch (error) {
        console.error("updateLocation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update location",
            error: error.message,
        });
    }
};

const getLiveLocation = async (req, res) => {
    try {
        const { busId } = req.query;
        const schoolId = req.user.schoolId;
        const userRole = req.user.role;

        // For parents, validate bus assignment
        if (userRole === "PARENT") {
            const parent = await Parent.findOne({ where: { userId: req.user.id } });
            if (parent) {
                const students = await Student.findAll({
                    where: { parentId: parent.id },
                    include: [{ model: StudentBusAssignment }],
                });

                const assignedBusIds = students
                    .map((s) => s.StudentBusAssignment?.busId)
                    .filter(Boolean);

                if (!assignedBusIds.includes(busId)) {
                    return res.status(403).json({
                        success: false,
                        message: "You are not authorized to track this bus",
                    });
                }
            }
        }

        // Validate bus belongs to school
        const bus = await Bus.findOne({ where: { id: busId, schoolId } });
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus not found",
            });
        }

        // Get last known location
        const location = await BusLocation.findOne({
            where: { busId },
            order: [["timestamp", "DESC"]],
        });

        // Get active trip status
        const activeTrip = await BusTrip.findOne({
            where: { busId, status: "IN_PROGRESS" },
            include: [{ model: BusRoute, attributes: ["routeName", "stops"] }],
        });

        res.json({
            success: true,
            data: {
                bus,
                location,
                activeTrip,
            },
        });
    } catch (error) {
        console.error("getLiveLocation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch live location",
            error: error.message,
        });
    }
};

const getLocationHistory = async (req, res) => {
    try {
        const { tripId } = req.params;
        const schoolId = req.user.schoolId;

        const trip = await BusTrip.findOne({ where: { id: tripId, schoolId } });
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found",
            });
        }

        const locations = await BusLocation.findAll({
            where: { tripId },
            order: [["timestamp", "ASC"]],
        });

        res.json({
            success: true,
            data: locations,
        });
    } catch (error) {
        console.error("getLocationHistory error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch location history",
            error: error.message,
        });
    }
};

// =====================
// STUDENT ASSIGNMENTS
// =====================

const assignStudentToBus = async (req, res) => {
    try {
        const { studentId, busId, routeId, stopName, pickupTime, dropoffTime } = req.body;
        const schoolId = req.user.schoolId;

        // Validate student
        const student = await Student.findOne({ where: { id: studentId, schoolId } });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        // Validate bus
        const bus = await Bus.findOne({ where: { id: busId, schoolId } });
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus not found",
            });
        }

        // Upsert assignment
        // const [assignment, created] = await StudentBusAssignment.upsert(
        //     {
        //         schoolId,
        //         studentId,
        //         busId,
        //         routeId: routeId || null,
        //         stopName: stopName || null,
        //         pickupTime: pickupTime || null,
        //         dropoffTime: dropoffTime || null,
        //         isActive: true,
        //     },
        //     {
        //         conflictFields: ["studentId"],
        //         returning: true,
        //     }
        // );

        const existingAssignment = await StudentBusAssignment.findOne({ where: { studentId } });
        if (existingAssignment) {
            await existingAssignment.update({
                busId,
                routeId: routeId || null,
                stopName: stopName || null,
                pickupTime: pickupTime || null,
                dropoffTime: dropoffTime || null,
                isActive: true,
            });
        } else {
            await StudentBusAssignment.create({
                schoolId,
                studentId,
                busId,
                routeId: routeId || null,
                stopName: stopName || null,
                pickupTime: pickupTime || null,
                dropoffTime: dropoffTime || null,
                isActive: true,
            });
        }


        res.status(!existingAssignment ? 201 : 200).json({
            success: true,
            message: !existingAssignment ? "Student assigned to bus" : "Assignment updated",

        });
    } catch (error) {
        console.error("assignStudentToBus error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign student to bus",
            error: error.message,
        });
    }
};

const getAssignedBus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get parent
        const parent = await Parent.findOne({ where: { userId } });
        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent profile not found",
            });
        }

        // Get children
        const students = await Student.findAll({
            where: { parentId: parent.id },
            include: [
                {
                    model: StudentBusAssignment,
                    include: [
                        {
                            model: Bus,
                            include: [{ model: User, as: "driver", attributes: ["name", "phone"] }],
                        },
                        {
                            model: BusRoute,
                            attributes: ["routeName", "stops"],
                        },
                    ],
                },
            ],
        });

        const busAssignments = students
            .filter((s) => s.StudentBusAssignment)
            .map((s) => ({
                studentId: s.id,
                studentName: s.name,
                assignment: s.StudentBusAssignment,
            }));

        res.json({
            success: true,
            data: busAssignments,
        });
    } catch (error) {
        console.error("getAssignedBus error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch assigned bus",
            error: error.message,
        });
    }
};

const getDriverBus = async (req, res) => {
    try {
        const driverId = req.user.id;
        const schoolId = req.user.schoolId;

        const bus = await Bus.findOne({
            where: { driverId, schoolId },
            include: [
                {
                    model: BusRoute,
                    where: { isActive: true },
                    required: false // Bus might not have a route yet
                }
            ]
        });

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "No bus assigned to this driver"
            });
        }

        res.json({
            success: true,
            data: bus
        });

    } catch (error) {
        console.error("getDriverBus error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch driver bus",
            error: error.message
        });
    }
};

const getBusAssignments = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { busId } = req.query;

        const where = { schoolId, isActive: true };
        if (busId) {
            where.busId = busId;
        }

        const assignments = await StudentBusAssignment.findAll({
            where,
            include: [
                {
                    model: Student,
                    attributes: ["id", "name", "admissionNumber"],
                },
                {
                    model: Bus,
                    attributes: ["id", "busNumber"],
                },
                {
                    model: BusRoute,
                    attributes: ["id", "routeName"],
                },
            ],
            order: [[Student, "name", "ASC"]],
        });

        res.json({
            success: true,
            data: assignments,
        });
    } catch (error) {
        console.error("getBusAssignments error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bus assignments",
            error: error.message,
        });
    }
};

const removeStudentFromBus = async (req, res) => {
    try {
        const { studentId } = req.params;
        const schoolId = req.user.schoolId;

        const assignment = await StudentBusAssignment.findOne({
            where: { studentId, schoolId },
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        await assignment.destroy();

        res.json({
            success: true,
            message: "Student removed from bus",
        });
    } catch (error) {
        console.error("removeStudentFromBus error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove student from bus",
            error: error.message,
        });
    }
};

module.exports = {
    // Buses
    createBus,
    getAllBuses,
    getBusById,
    updateBus,
    deleteBus,
    // Routes
    createRoute,
    getRoutes,
    updateRoute,
    deleteRoute,
    // Trips
    startTrip,
    endTrip,
    getTripHistory,
    // Location
    updateLocation,
    getLiveLocation,
    getLocationHistory,
    // Assignments
    assignStudentToBus,
    getAssignedBus,
    getBusAssignments,
    removeStudentFromBus,
    getDriverBus
};
