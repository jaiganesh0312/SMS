const {
  User,
  Parent,
  Student,
  Timetable,
  Attendance,
  ExamResult,
  Subject,
  Class,
  Exam,
  School,
  ClassSection,
} = require("../models");
const bcrypt = require("bcryptjs");
const { sendParentAccountEmail } = require("../services/emailService");

// --- Admin Features ---

exports.createParent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      occupation,
      studentIds, // Array of student IDs to link
    } = req.body;
    const schoolId = req.user.schoolId;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one student to link." });
    }

    // Check if user is TEACHER, verify they are the class teacher for these students
    if (req.user.role === 'TEACHER') {
      const { Class } = require('../models');
      // Get classes for all selected students
      const students = await Student.findAll({ where: { id: studentIds, schoolId }, include: [{ model: Class }] });

      // Check if any student is NOT in a class taught by this teacher
      const unauthorizedStudents = students.filter(student => !student.Class || student.Class.classTeacherId !== req.user.id);

      if (unauthorizedStudents.length > 0) {
        return res.status(403).json({
          success: false,
          message: "You can only create parents for students in your assigned class(es)."
        });
      }
    }

    // 1. Create User Account
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      schoolId,
      role: "PARENT",
      isActive: true,
    });

    // 2. Create Parent Profile
    const newParent = await Parent.create({
      schoolId,
      userId: newUser.id,
      guardianName: name,
      occupation,
    });

    // 3. Link Students
    // Update the parentId of the selected students
    await Student.update(
      { parentId: newParent.id },
      { where: { id: studentIds, schoolId } } // Ensure students belong to the same school
    );

    // 4. Send Welcome Email
    const linkedStudents = await Student.findAll({ where: { id: studentIds }, attributes: ['name'] });
    const studentNames = linkedStudents.map(s => s.name);
    const school = await School.findByPk(schoolId);

    const schoolLogoUrl = school.logo ? `${req.protocol}://${req.get('host')}/api/${school.logo}` : null;
    await sendParentAccountEmail(school.name, name, email, password, studentNames, schoolLogoUrl);

    res.status(201).json({
      success: true,
      message: "Parent profile created and students linked successfully",
      data: {
        user: newUser,
        parent: newParent,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllParents = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const parents = await Parent.findAll({
      where: { schoolId },
      include: [
        { model: User, attributes: ["name", "email", "phone"] },
        { model: Student, attributes: ["name", "admissionNumber"] }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      success: true,
      message: "Parents fetched successfully",
      data: { parents },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// --- Parent Features ---

exports.getMyChildren = async (req, res) => {
  try {
    const parent = await Parent.findOne({ where: { userId: req.user.id } });
    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }

    const { FeeStructure, FeePayment, Attendance, ExamResult } = require("../models");
    const { sequelize } = require("../config/database");

    const students = await Student.findAll({
      where: { parentId: parent.id },
      include: [{ model: Class, include: ["School"] }, { model: ClassSection }],
    });

    // Enhance each student with aggregated data
    const enhancedStudents = await Promise.all(students.map(async (student) => {
      const studentData = student.toJSON();

      // Fee Summary
      if (student.classId) {
        const feeStructures = await FeeStructure.findAll({ where: { classId: student.classId, schoolId: student.schoolId } });
        const payments = await FeePayment.findAll({ where: { studentId: student.id, schoolId: student.schoolId } });
        const totalFees = feeStructures.reduce((sum, fs) => sum + Number(fs.amount), 0);
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
        studentData.feeSummary = {
          totalFees,
          totalPaid,
          totalPending: totalFees - totalPaid
        };
      } else {
        studentData.feeSummary = { totalFees: 0, totalPaid: 0, totalPending: 0 };
      }

      // Attendance Rate
      const attendanceRecords = await Attendance.findAll({ where: { studentId: student.id } });
      const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
      studentData.attendanceRate = attendanceRecords.length > 0 ? ((presentCount / attendanceRecords.length) * 100).toFixed(1) : 0;

      // Latest Exam Average
      const examResults = await ExamResult.findAll({
        where: { studentId: student.id },
        order: [['createdAt', 'DESC']],
        limit: 5
      });
      if (examResults.length > 0) {
        const avgPercentage = examResults.reduce((sum, r) => sum + ((r.obtainedMarks / r.totalMarks) * 100), 0) / examResults.length;
        studentData.latestExamAverage = avgPercentage.toFixed(1);
      } else {
        studentData.latestExamAverage = null;
      }

      return studentData;
    }));

    res.status(200).json({
      success: true,
      message: "Children fetched successfully",
      data: { students: enhancedStudents },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getChildDashboard = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parent = await Parent.findOne({ where: { userId: req.user.id } });

    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }

    // 1. Verify Ownership
    const student = await Student.findOne({
      where: { id: studentId, parentId: parent.id },
      include: [{ model: Class }, { model: ClassSection }],
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this student's data",
      });
    }

    // 2. Fetch Data
    // A. TimeTable (Based on Class)
    let timetable = [];
    if (student.Class && student.Class.id) {
      timetable = await Timetable.findAll({
        where: { classId: student.Class.id },
        include: [
          { model: Subject, attributes: ['name', 'code'] },
          { model: User, attributes: ['name'] } // Teacher Name
        ]
      });
    }

    // B. Attendance
    const attendance = await Attendance.findAll({
      where: { studentId },
      order: [['date', 'DESC']],
      limit: 30 // Last 30 records
    });

    // C. Marks (Exam Results)
    const examResults = await ExamResult.findAll({
      where: { studentId },
      include: [
        { model: Exam, attributes: ['name', 'startDate'] },
        { model: Subject, attributes: ['name', 'code'] }
      ],
      order: [[{ model: Exam }, 'startDate', 'DESC']]
    });

    // D. Fee Information
    const { FeeStructure, FeePayment } = require("../models");
    let feeInfo = { totalFees: 0, totalPaid: 0, totalPending: 0, feeStructures: [], recentPayments: [] };

    if (student.classId) {
      const feeStructures = await FeeStructure.findAll({ where: { classId: student.classId, schoolId: student.schoolId } });
      const payments = await FeePayment.findAll({ where: { studentId, schoolId: student.schoolId }, include: [{ model: FeeStructure, attributes: ['name', 'amount'] }], order: [['paymentDate', 'DESC']], limit: 5 });
      const totalFees = feeStructures.reduce((sum, fs) => sum + Number(fs.amount), 0);
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
      feeInfo = { totalFees, totalPaid, totalPending: totalFees - totalPaid, feeStructures: feeStructures.map(fs => ({ id: fs.id, name: fs.name, amount: Number(fs.amount), frequency: fs.frequency })), recentPayments: payments.map(p => ({ id: p.id, feeName: p.FeeStructure?.name, amount: Number(p.amountPaid), date: p.paymentDate, transactionId: p.transactionId })) };
    }

    // E. Calculate attendance percentage
    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(a => ['PRESENT', 'present', 'LATE', 'late', 'HALF_DAY', 'half_day'].includes(a.status?.toUpperCase())).length;
    const attendancePercentage = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0;

    // F. Format exam results and group by exam
    const examsByExam = {};
    examResults.forEach(result => {
      const examId = result.Exam.id; // Group by ID instead of name
      if (!examsByExam[examId]) {
        examsByExam[examId] = {
          examId: result.Exam.id,
          examName: result.Exam.name,
          examDate: result.Exam.startDate,
          subjects: [],
          totalObtained: 0,
          totalMax: 0
        };
      }
      examsByExam[examId].subjects.push({
        subjectName: result.Subject.name,
        obtainedMarks: result.obtainedMarks,
        totalMarks: result.totalMarks,
        percentage: ((result.obtainedMarks / result.totalMarks) * 100).toFixed(1)
      });
      examsByExam[examId].totalObtained += result.obtainedMarks;
      examsByExam[examId].totalMax += result.totalMarks;
    });

    const formattedExamResults = Object.values(examsByExam).map(exam => ({
      ...exam,
      overallPercentage: ((exam.totalObtained / exam.totalMax) * 100).toFixed(1)
    }));

    res.status(200).json({
      success: true,
      message: "Student dashboard data fetched",
      data: {
        student,
        school: student.Class?.School || null,
        timetable,
        attendance,
        attendancePercentage,
        examResults: formattedExamResults,
        rawExamResults: examResults,
        feeInfo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
