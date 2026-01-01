const { StaffProfile } = require("../models");

exports.restrictToFeeCollection = async (req, res, next) => {
    try {
        // 1. Allow Super Admin and School Admin immediately
        if (["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(req.user.role)) {
            return next();
        }

        // 2. If user is invalid or not staff, deny
        if (req.user.role !== "STAFF") {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action",
            });
        }

        // 3. For STAFF, check Department
        // We need to fetch the profile since it's not always loaded on req.user
        const staffProfile = await StaffProfile.findOne({
            where: { userId: req.user.id }
        });

        if (!staffProfile) {
            return res.status(403).json({
                success: false,
                message: "Staff profile not found. Access denied.",
            });
        }

        // Normalize department check (case-insensitive)
        const department = staffProfile.department ? staffProfile.department.toUpperCase() : "";

        if (department === "ACCOUNTS") {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "Only Accounts Department staff can perform this action",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error during authorization",
        });
    }
};
