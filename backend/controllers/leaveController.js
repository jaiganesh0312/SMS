const { Leave, User, StaffProfile } = require("../models");
const { Op } = require("sequelize");

exports.applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        const userId = req.user.id;
        const schoolId = req.user.schoolId;
        const role = req.user.role; // TEACHER, STAFF, STUDENT

        if (!startDate || !endDate || !type) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const newLeave = await Leave.create({
            schoolId,
            applicantId: userId,
            role,
            type,
            startDate,
            endDate,
            reason,
            status: "PENDING"
        });

        res.status(201).json({
            success: true,
            message: "Leave application submitted successfully",
            data: { leave: newLeave }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyLeaves = async (req, res) => {
    try {
        const userId = req.user.id;
        const leaves = await Leave.findAll({
            where: { applicantId: userId },
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json({
            success: true,
            data: { leaves }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllLeaves = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { status, role } = req.query;

        const where = { schoolId };
        if (status) where.status = status;
        if (role) where.role = role;

        const leaves = await Leave.findAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ["id", "name", "email", "role"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json({
            success: true,
            message: "Leaves fetched successfully",
            data: { leaves }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED, REJECTED

        if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const leave = await Leave.findOne({ where: { id, schoolId: req.user.schoolId } });

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave not found" });
        }

        leave.status = status;
        await leave.save();

        // TODO: Send notification email to applicant

        res.status(200).json({
            success: true,
            message: `Leave ${status.toLowerCase()} successfully`,
            data: { leave }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
