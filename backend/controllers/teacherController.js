const { Class, ClassSection, Student, User, School, Announcement, Timetable, Subject, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get My Class (Teacher's assigned classes)
exports.getMyClass = async (req, res) => {
    try {
        const { id: teacherId, schoolId } = req.user;

        const mySection = await ClassSection.findOne({
            where: { classTeacherId: teacherId }, // removed schoolId from where because ClassSection might not have schoolId directly if it relies on Class? 
            // Wait, ClassSection definition didn't have schoolId. It has classId.
            // But we can filter by including Class with schoolId. 
            // OR I should have added schoolId to ClassSection for easier querying?
            // "ClassSection" model definition in Step 22 did NOT have schoolId.
            // So accessing schoolId requires include Class.

            include: [
                {
                    model: Class,
                    where: { schoolId }, // Filter by school here
                    attributes: ['id', 'name']
                },
                {
                    model: Student,
                    attributes: ['id', 'name', 'admissionNumber', 'gender']
                }
            ]
        });

        if (!mySection) {
            return res.status(404).json({
                success: false,
                message: "No class assigned to you as a Class Teacher"
            });
        }


        res.status(200).json({
            success: true,
            message: "Class details fetched successfully",
            data: mySection
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Students of My Class
exports.getMyStudents = async (req, res) => {
    try {
        const { id: teacherId, schoolId } = req.user;

        const mySection = await ClassSection.findOne({
            where: { classTeacherId: teacherId }
        });

        if (!mySection) {
            return res.status(404).json({
                success: false,
                message: "You are not assigned as a Class Teacher to any class."
            });
        }

        const students = await Student.findAll({
            where: { sectionId: mySection.id, schoolId },
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            message: "Students fetched successfully",
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Generate ID Card Data
exports.getIDCardData = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { id: userId, role, schoolId } = req.user;

        // Verify student exists
        const student = await Student.findByPk(studentId, {
            include: [
                { model: Class, as: 'Class' },
                { model: ClassSection, as: 'ClassSection' }, // Added Include
                { model: School, as: 'School' }
            ]
        });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Access Control
        if (role === 'TEACHER') {
            // Check if teacher is the class teacher
            if (!student.ClassSection || student.ClassSection.classTeacherId !== userId) { // Use ClassSection check
                return res.status(403).json({ success: false, message: "You can only generate ID cards for your own class." });
            }
        } else if (role === 'PARENT') {
            // Check if parent owns the student
            // Assuming parentController logic ensures this mapping exists in DB, 
            // but here we check the parentId on student record against current user's Parent profile
            const parent = await require('../models').Parent.findOne({ where: { userId } });
            if (!parent || student.parentId !== parent.id) {
                return res.status(403).json({ success: false, message: "Unauthorized to access this student's ID card" });
            }
        } else if (role !== 'SCHOOL_ADMIN' && role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Prepare ID Card Data
        const idCardData = {
            schoolName: student.School.name,
            schoolAddress: student.School.address, // Assuming address exists in School model
            schoolLogo: student.School.logo, // Assuming logo exists
            studentName: student.name,
            admissionNumber: student.admissionNumber,
            class: student.Class && student.ClassSection ? `${student.Class.name} - ${student.ClassSection.name}` : (student.Class ? student.Class.name : 'N/A'),
            dob: student.dob,
            bloodGroup: student.bloodGroup || 'N/A', // Assuming bloodGroup might be added later
            fatherName: student.fatherName || 'Parent', // You might want to fetch Parent name
            emergencyContact: student.emergencyContact || 'N/A'
        };

        res.status(200).json({
            success: true,
            message: "ID Card data generated",
            data: idCardData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Get My Periods (Teacher's assigned periods)
exports.getMyPeriods = async (req, res) => {
    try {
        const { id: teacherId, schoolId } = req.user;

        const periods = await Timetable.findAll({
            where: { teacherId, schoolId },
            include: [

                {
                    model: ClassSection,
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: Class,
                            attributes: ['id', 'name']
                        }
                    ]
                },
                {
                    model: Subject,
                    attributes: ['id', 'name', 'code']
                }
            ],

        });

        res.status(200).json({
            success: true,
            message: "Periods fetched successfully",
            data: periods
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get My Class Timetable (Timetable of the class where I am Class Teacher)
exports.getMyClassTimetable = async (req, res) => {
    try {
        const { id: teacherId, schoolId } = req.user;

        // 1. Find the class (section) managed by this teacher
        const mySection = await ClassSection.findOne({
            where: { classTeacherId: teacherId },
            include: [{ model: Class, where: { schoolId } }]
        });

        if (!mySection) {
            return res.status(404).json({
                success: false,
                message: "You are not assigned as a Class Teacher to any class."
            });
        }

        // 2. Fetch timetable for this section
        const timetable = await Timetable.findAll({
            where: { sectionId: mySection.id, schoolId },
            include: [
                {
                    model: Subject,
                    attributes: ['id', 'name', 'code']
                },
                {
                    model: User, // Key is teacherId, but alias might be needed if defined in associations
                    attributes: ['id', 'name'] // Assuming User has these fields
                }
            ],

        });

        res.status(200).json({
            success: true,
            message: "Class timetable fetched successfully",
            data: {
                classDetails: mySection,
                timetable
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
