const { StaffAttendance, StaffProfile, School } = require("../models");
const { Op } = require("sequelize");

exports.markAttendance = async (req, res) => {
    try {
        const { date, attendanceData } = req.body; // attendanceData: [{ staffId, status, checkIn, checkOut }]
        const schoolId = req.user.schoolId;

        if (!attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({ success: false, message: "Invalid data" });
        }

        // Validate Joining Date and Active Status
        const staffIds = attendanceData.map(d => d.staffId);
        const staffProfiles = await StaffProfile.findAll({
            where: {
                id: staffIds,
                schoolId
            }
        });

        const staffMap = {};
        staffProfiles.forEach(s => staffMap[s.id] = s);

        const cleanRecords = [];
        const errors = [];

        for (const data of attendanceData) {
            const staff = staffMap[data.staffId];
            if (!staff) {
                errors.push(`Staff ID ${data.staffId} not found`);
                continue;
            }

            if (staff.status !== 'ACTIVE') {
                errors.push(`Staff ${staff.employeeCode} is not ACTIVE`);
                continue;
            }

            // if (new Date(date) < new Date(staff.joiningDate)) {
            //     errors.push(`Cannot mark attendance for ${staff.employeeCode} before joining date (${staff.joiningDate})`);
            //     continue;
            // }

            cleanRecords.push({
                schoolId,
                staffId: data.staffId,
                date,
                status: data.status,
                checkInTime: data.checkInTime || null,
                checkOutTime: data.checkOutTime || null,
                remarks: data.remarks || null,
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({ success: false, message: "Validation failed", errors });
        }

        await StaffAttendance.bulkCreate(cleanRecords, {
            updateOnDuplicate: ["status", "checkInTime", "checkOutTime", "remarks", "updatedAt"]
        });

        res.status(200).json({ success: true, message: "Attendance marked successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getAttendance = async (req, res) => {
    try {
        const { date } = req.query;
        const schoolId = req.user.schoolId;

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required" });
        }

        // 1. Fetch all active staff for the school who joined on or before this date
        const allStaff = await StaffProfile.findAll({
            where: {
                schoolId,
                status: 'ACTIVE',
                joiningDate: { [Op.lte]: date }
            },
            include: ["User"],
        });

        // 2. Fetch existing attendance for the date
        const attendanceRecords = await StaffAttendance.findAll({
            where: { schoolId, date },
            include: [
                {
                    model: StaffProfile,
                    include: ["User"],
                },
            ],
            order: [["updatedAt", "DESC"]],
        });

        // 3. Separate into Marked and Pending
        // Create a set of staff IDs that have attendance
        const markedStaffIds = new Set(attendanceRecords.map(r => r.staffId));

        const marked = attendanceRecords;
        const pending = allStaff.filter(staff => !markedStaffIds.has(staff.id));

        res.status(200).json({
            success: true,
            data: {
                marked,
                pending
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        const schoolId = req.user.schoolId;

        const attendance = await StaffAttendance.findOne({
            where: { id, schoolId }
        });

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance record not found" });
        }

        attendance.status = status;
        attendance.remarks = remarks;
        await attendance.save();

        res.status(200).json({ success: true, message: "Attendance updated successfully", data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
