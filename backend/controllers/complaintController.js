const { Complaint, Parent } = require("../models");

// Create a new complaint (Parent only)
exports.createComplaint = async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        const userId = req.user.id;
        const schoolId = req.user.schoolId;

        // Find Parent profile linked to this User
        const parent = await Parent.findOne({ where: { userId } });
        if (!parent) {
            return res.status(404).json({ success: false, message: "Parent profile not found." });
        }

        const newComplaint = await Complaint.create({
            schoolId,
            parentId: parent.id,
            title,
            description,
            priority: priority || "Medium"
        });

        res.status(201).json({
            success: true,
            message: "Complaint submitted successfully",
            data: { complaint: newComplaint }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all complaints (Admin & Teacher)
exports.getAllComplaints = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { status, priority } = req.query;

        const where = { schoolId };
        if (status) where.status = status;
        if (priority) where.priority = priority;

        const complaints = await Complaint.findAll({
            where,
            include: [
                {
                    model: Parent,
                    attributes: ["guardianName", "occupation"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json({
            success: true,
            message: "Complaints fetched successfully",
            results: complaints.length,
            data: { complaints }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get my complaints (Parent)
exports.getMyComplaints = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find Parent profile linked to this User
        const parent = await Parent.findOne({ where: { userId } });
        if (!parent) {
            return res.status(404).json({ success: false, message: "Parent profile not found." });
        }

        const complaints = await Complaint.findAll({
            where: { parentId: parent.id },
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json({
            success: true,
            message: "Your complaints fetched successfully",
            results: complaints.length,
            data: { complaints }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
