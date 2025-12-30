const { Attendance, Class, Student } = require("../models");
const { Op } = require("sequelize");

exports.markAttendance = async (req, res) => {
    try {
        // Expecting array of objects: [{ studentId, status, date }]
        // OR bulk for a class: { classId, date, students: [{ studentId, status }] }

        // Implementing Bulk for Class which is most common
        const { classId, date, students, attendance } = req.body;
        const studentList = students || attendance;
        const schoolId = req.user.schoolId;
        const recordedBy = req.user.id;

        if (!studentList || !Array.isArray(studentList)) {
            return res.status(400).json({
                success: false,
                message: "Invalid students data"
            });
        }

        // Use transaction for consistency
        // Simple loop for now, bulkCreate is faster but need to handle updates ("upsert")
        // Sequelize bulkCreate with updateOnDuplicate

        const records = studentList.map(s => ({
            schoolId,
            classId,
            studentId: s.studentId,
            date,
            status: s.status,
            recordedBy
        }));

        // updateOnDuplicate need specific fields
        await Attendance.bulkCreate(records, {
            updateOnDuplicate: ["status", "recordedBy", "updatedAt"]
        });

        res.status(200).json({
            success: true,
            message: "Attendance marked successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.getAttendance = async (req, res) => {
    try {
        const { classId, date } = req.query;
        const schoolId = req.user.schoolId;

        if (!classId || !date) {
            return res.status(400).json({ success: false, message: "Class ID and Date are required" });
        }

        // 1. Fetch all students in the class
        const students = await Student.findAll({
            where: { classId, schoolId },
            order: [['name', 'ASC']]
        });

        // 2. Fetch existing attendance for the date
        const attendanceRecords = await Attendance.findAll({
            where: { classId, schoolId, date },
            include: [
                {
                    model: Student,
                    attributes: ['id', 'name', 'admissionNumber', 'profilePicture']
                }
            ]
        });

        // 3. Separate into Marked and Pending
        const markedStudentIds = new Set(attendanceRecords.map(r => r.studentId));

        const marked = attendanceRecords;
        const pending = students.filter(s => !markedStudentIds.has(s.id));

        res.status(200).json({
            success: true,
            data: {
                marked,
                pending
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const schoolId = req.user.schoolId;

        const attendance = await Attendance.findOne({
            where: { id, schoolId }
        });

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance record not found" });
        }

        attendance.status = status;
        await attendance.save();

        res.status(200).json({ success: true, message: "Attendance updated successfully", data: attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAttendanceReport = async (req, res) => {
    try {
        const { classId, date, studentId, startDate, endDate } = req.query;
        const schoolId = req.user.schoolId;

        const where = { schoolId };
        if (classId) where.classId = classId;
        if (studentId) where.studentId = studentId;

        if (date) {
            where.date = date;
        } else if (startDate && endDate) {
            // Date range query logic here (using Op.between)
            // For simple MVP let's stick to simple equal or full listing
        }

        const attendance = await Attendance.findAll({
            where,
            include: [
                { model: Student, attributes: ['name', 'admissionNumber'] }
            ]
        });

        res.status(200).json({
            success: true,
            message: "Attendance report fetched successfully",
            results: attendance.length,
            data: { attendance }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

