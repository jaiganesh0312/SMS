const { Student, Parent, Class, School, User } = require("../models");
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const generateIDCardTemplate = require('../utils/idCardTemplate');
const { literal } = require("sequelize");

exports.createStudent = async (req, res) => {
  try {
    const { name, admissionNumber, dob, gender, parentId, classId } = req.body;
    const schoolId = req.user.schoolId;

    // Check if admission number already exists in the school
    const existingStudent = await Student.findOne({
      where: { schoolId, admissionNumber },
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this Admission Number already exists.",
      });
    }

    const newStudent = await Student.create({
      schoolId,
      name,
      admissionNumber,
      dob,
      gender,
      parentId: parentId || null,
      classId: classId || null,
    });

    // Link to class if specific
    // Note: Class-Student link usually happens via Enrollments or direct FK depending on schema. 
    // Checking schema: Student does NOT have classId directly in the model provided in context?
    // Let's re-read Student.js context in a moment. For now, we create the basic student.

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: { student: newStudent },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    let schoolId = req.user.schoolId;
    const { parentId, schoolId: querySchoolId, classId } = req.query; // Support filtering by parentId and schoolId

    // If user is SUPER_ADMIN, they can provide a schoolId in query
    if (req.user.role === 'SUPER_ADMIN' && querySchoolId) {
      schoolId = querySchoolId;
    }

    const where = {};
    if (schoolId) {
      where.schoolId = schoolId;
    }

    if (parentId === 'null') {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    if (classId) {
      where.classId = classId;
    }

    const students = await Student.findAll({
      where,
      include: [
        { model: Parent, attributes: ["guardianName", "occupation"] },
        { model: Class, attributes: ["name", "section"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      results: students.length,
      data: { students },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const schoolId = req.user.schoolId;

    const student = await Student.findOne({ where: { id, schoolId } });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await student.update(updates);

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: { student },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.bulkUpdateStudents = async (req, res) => {
  try {
    const { studentIds, classId, parentId, updates } = req.body; // Added parentId
    const schoolId = req.user.schoolId;

    let updatedCount = 0;

    if (studentIds && studentIds.length > 0 && (classId || parentId)) {
      // Bulk update fields
      const updatePayload = {};
      if (classId) updatePayload.classId = classId;
      if (parentId) updatePayload.parentId = parentId;

      const result = await Student.update(
        updatePayload,
        {
          where: {
            id: { [require("sequelize").Op.in]: studentIds },
            schoolId,
          },
        }
      );
      updatedCount = result[0];
    } else if (updates && Array.isArray(updates)) {
      // Batch update logic (different updates for different students)
      for (const update of updates) {
        if (update.studentId) {
          const updatePayload = {};
          if (update.classId) updatePayload.classId = update.classId;
          if (update.parentId) updatePayload.parentId = update.parentId;

          await Student.update(
            updatePayload,
            { where: { id: update.studentId, schoolId } }
          );
          updatedCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedCount} students`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const student = await Student.findOne({ where: { id, schoolId } });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a file" });
    }

    // Delete old profile picture if exists
    if (student.profilePicture) {
      const oldPath = path.join(__dirname, '..', student.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save relative path
    const relativePath = `uploads/students/${req.file.filename}`;

    student.profilePicture = relativePath;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: { profilePicture: relativePath }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateIDCard = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const student = await Student.findOne({
      where: { id, schoolId },
      include: [
        { model: Class, attributes: ['name', 'section'] },
        {
          model: Parent,
          attributes: ['guardianName', 'userId'],
          include: [{ model: User, attributes: ['phone', 'email'] }]
        },
        { model: School, attributes: ['name', 'address', 'logo'] }
      ]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Generate HTML

    const htmlContent = generateIDCardTemplate(student, student.School, req.protocol, req.get('host'));

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      width: '3.375in',
      height: '4.75in', // ID-1 Portrait
      printBackground: true,
      pageRanges: '1'
    });

    await browser.close();

    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="id-card-${student.admissionNumber}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
