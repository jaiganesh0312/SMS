const { Exam, ExamResult, Student, Subject, GradeRule, Class, Parent, School, ClassSection } = require("../models");
const { Op } = require("sequelize");
const puppeteer = require('puppeteer');
const generateReportCardTemplate = require('../utils/reportCardTemplate');

// --- Exam Management ---
exports.createExam = async (req, res) => {
    try {
        const { sectionId, classId, name, type, startDate, endDate } = req.body;
        const schoolId = req.user.schoolId;

        const newExam = await Exam.create({
            schoolId, classId, sectionId, name, type, startDate, endDate
        });

        res.status(201).json({
            success: true,
            message: "Exam created successfully",
            data: { exam: newExam }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getExams = async (req, res) => {
    try {
        let schoolId = req.user.schoolId;
        const { classId, sectionId, schoolId: querySchoolId } = req.query;

        if (req.user.role === 'SUPER_ADMIN' && querySchoolId) {
            schoolId = querySchoolId;
        }

        const where = {};
        if (schoolId) {
            where.schoolId = schoolId;
        }
        if (classId) where.classId = classId;

        // Filter by section if provided (fetch generic class exams + specific section exams)
        if (sectionId) {
            where[Op.or] = [
                { sectionId: null },
                { sectionId: sectionId }
            ];
        } else if (classId) where.sectionId = null;

        const exams = await Exam.findAll({
            where,
            include: [
                { model: Class },
                { model: ClassSection }
            ],
            order: [["startDate", "DESC"]]
        });

        res.status(200).json({
            success: true,
            message: "Exams fetched successfully",
            results: exams.length,
            data: { exams }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// --- Results Management ---
exports.addExamResult = async (req, res) => {
    try {
        // Bulk add results for a subject in an exam
        // { examId, subjectId, results: [{ studentId, marksObtained, maxMarks }] }
        const { examId, subjectId, results } = req.body;
        const schoolId = req.user.schoolId;

        if (!results || !Array.isArray(results)) {
            return res.status(400).json({
                success: false,
                message: "Invalid results data"
            });
        }

        // Fetch grade rules for this school
        const gradeRules = await GradeRule.findAll({ where: { schoolId } });

        const resultRecords = results.map(r => {
            const percentage = (r.marksObtained / (r.maxMarks || 100)) * 100;

            // Find matching rule
            const matchingRule = gradeRules.find(rule =>
                percentage >= rule.minPercentage && percentage <= rule.maxPercentage
            );

            return {
                schoolId,
                examId,
                subjectId,
                studentId: r.studentId,
                marksObtained: r.marksObtained,
                maxMarks: r.maxMarks || 100,
                grade: matchingRule ? matchingRule.grade : null,
                remarks: matchingRule ? matchingRule.description : null
            };
        });

        await ExamResult.bulkCreate(resultRecords, {
            updateOnDuplicate: ["marksObtained", "maxMarks", "grade", "remarks", "updatedAt"],
        });

        res.status(200).json({
            success: true,
            message: "Results added successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Helper for grade calculation
const calculateGradeAndRemark = (percentage, gradeRules) => {
    const matchingRule = gradeRules.find(rule =>
        percentage >= rule.minPercentage && percentage <= rule.maxPercentage
    );
    return {
        grade: matchingRule ? matchingRule.grade : null,
        remarks: matchingRule ? matchingRule.description : null
    };
};

exports.updateExamResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { marksObtained, maxMarks } = req.body;
        const schoolId = req.user.schoolId;

        const result = await ExamResult.findOne({
            where: { id, schoolId },
            include: [{ model: Subject }] // Optional: if we need to check constraints
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Result not found"
            });
        }

        // Use provided maxMarks or existing
        const currentMaxMarks = maxMarks !== undefined ? maxMarks : result.maxMarks;

        // Calculate new Grade/Remarks
        const gradeRules = await GradeRule.findAll({ where: { schoolId } });
        const percentage = (marksObtained / (currentMaxMarks || 100)) * 100;
        const { grade, remarks } = calculateGradeAndRemark(percentage, gradeRules);

        // Update
        result.marksObtained = marksObtained;
        if (maxMarks !== undefined) result.maxMarks = maxMarks;
        result.grade = grade;
        result.remarks = remarks;

        await result.save();

        res.status(200).json({
            success: true,
            message: "Result updated successfully",
            data: { result }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getExamResults = async (req, res) => {
    try {
        let schoolId = req.user.schoolId;
        const { examId, subjectId, classId, schoolId: querySchoolId } = req.query;

        if (req.user.role === 'SUPER_ADMIN' && querySchoolId) {
            schoolId = querySchoolId;
        }

        const where = {};
        if (schoolId) {
            where.schoolId = schoolId;
        }
        if (examId) where.examId = examId;
        // If subjectId is provided, we fetch specific subject results, but grouping logic still applies if we want consistent format.
        if (subjectId) where.subjectId = subjectId;

        // Fetch all raw results
        const rawResults = await ExamResult.findAll({
            where,
            include: [
                {
                    model: Student,
                    attributes: ["id", "name", "admissionNumber"],
                    where: {
                        ...(classId ? { classId } : {}),
                        ...(req.query.sectionId ? { sectionId: req.query.sectionId } : {})
                    }
                },
                { model: Subject, attributes: ["id", "name", "code"] },
                { model: Exam, attributes: ["name", "type"] }
            ],
            order: [[Student, "name", "ASC"]]
        });

        // Group by Student
        const studentsMap = {};

        rawResults.forEach(result => {
            const studentId = result.Student.id;

            if (!studentsMap[studentId]) {
                studentsMap[studentId] = {
                    student: result.Student,
                    exam: result.Exam,
                    results: [],
                    totalObtained: 0,
                    totalMax: 0
                };
            }

            studentsMap[studentId].results.push({
                id: result.id,
                subject: result.Subject,
                marksObtained: result.marksObtained,
                maxMarks: result.maxMarks,
                grade: result.grade,
                remarks: result.remarks
            });

            studentsMap[studentId].totalObtained += result.marksObtained;
            studentsMap[studentId].totalMax += result.maxMarks;
            studentsMap[studentId].isFailed = studentsMap[studentId].isFailed || result.grade === "F";
        });

        const groupedResults = Object.values(studentsMap).map(item => ({
            ...item,
            percentage: item.totalMax > 0 ? (item.totalObtained / item.totalMax) * 100 : 0
        }));

        res.status(200).json({
            success: true,
            message: "Exam results fetched successfully",
            results: groupedResults.length,
            data: { results: groupedResults }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getStudentReportCard = async (req, res) => {
    try {
        const { studentId, examId } = req.query;
        const schoolId = req.user.schoolId;

        const where = { schoolId, studentId };
        if (examId) where.examId = examId;

        const results = await ExamResult.findAll({
            where,
            include: [
                { model: Subject, attributes: ["name", "code"] },
                { model: Exam, attributes: ["name", "type"] }
            ]
        });

        res.status(200).json({
            success: true,
            message: "Report card fetched successfully",
            results: results.length,
            data: { report: results }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getStudentExamResults = async (req, res) => {
    try {
        const { studentId } = req.query;
        const schoolId = req.user.schoolId;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required"
            });
        }

        // Verify student exists and belongs to this school
        const student = await Student.findOne({
            where: { id: studentId, schoolId },
            include: [{ model: Class }]
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Fetch all exam results for the student
        const results = await ExamResult.findAll({
            where: { studentId, schoolId },
            include: [
                {
                    model: Exam,
                    attributes: ['id', 'name', 'type', 'startDate', 'endDate']
                },
                {
                    model: Subject,
                    attributes: ['id', 'name', 'code']
                }
            ],
            order: [[{ model: Exam }, 'startDate', 'DESC']]
        });

        // Group results by exam
        const examGroups = {};

        results.forEach(result => {
            const examId = result.Exam.id;

            if (!examGroups[examId]) {
                examGroups[examId] = {
                    examId: result.Exam.id,
                    examName: result.Exam.name,
                    examType: result.Exam.type,
                    startDate: result.Exam.startDate,
                    endDate: result.Exam.endDate,
                    className: student.Class && student.ClassSection ? `${student.Class.name} - ${student.ClassSection.name}` : (student.Class ? student.Class.name : 'N/A'),
                    classId: student.classId,
                    subjects: [],
                    totalObtained: 0,
                    totalMax: 0
                };
            }

            examGroups[examId].subjects.push({
                subjectId: result.Subject.id,
                subjectName: result.Subject.name,
                subjectCode: result.Subject.code,
                marksObtained: result.marksObtained,
                maxMarks: result.maxMarks,
                percentage: ((result.marksObtained / result.maxMarks) * 100).toFixed(1),
                grade: result.grade,
                remarks: result.remarks
            });


            examGroups[examId].totalObtained += result.marksObtained;
            examGroups[examId].totalMax += result.maxMarks;
        });

        // Calculate overall percentage for each exam
        const examResults = Object.values(examGroups).map(exam => ({
            ...exam,
            overallPercentage: exam.totalMax > 0
                ? ((exam.totalObtained / exam.totalMax) * 100).toFixed(2)
                : 0
        }));

        res.status(200).json({
            success: true,
            message: "Student exam results fetched successfully",
            results: examResults.length,
            data: {
                student: {
                    id: student.id,
                    name: student.name,
                    admissionNumber: student.admissionNumber,
                    class: student.Class && student.ClassSection ? `${student.Class.name} - ${student.ClassSection.name}` : (student.Class ? student.Class.name : 'N/A')
                },
                examResults
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.downloadReportCard = async (req, res) => {
    try {
        const { studentId, examId } = req.query;
        const schoolId = req.user.schoolId;

        if (!studentId || !examId) {
            return res.status(400).json({ success: false, message: "Student ID and Exam ID are required" });
        }

        const student = await Student.findOne({
            where: { id: studentId, schoolId },
            include: [
                { model: Class },
                { model: ClassSection },
                { model: Parent, include: [{ model: require('../models').User, attributes: ['phone'] }] },
                { model: School }
            ]
        });

        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        const exam = await Exam.findOne({ where: { id: examId, schoolId } });
        if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

        const results = await ExamResult.findAll({
            where: { studentId, examId, schoolId },
            include: [{ model: Subject }]
        });

        const allExamResults = await ExamResult.findAll({
            where: { examId, schoolId },
            attributes: ['studentId', 'marksObtained']
        });

        const studentScores = {};
        allExamResults.forEach(r => {
            if (!studentScores[r.studentId]) studentScores[r.studentId] = 0;
            studentScores[r.studentId] += r.marksObtained;
        });

        const sortedScores = Object.entries(studentScores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
        const rank = sortedScores.findIndex(([id]) => id === studentId) + 1;
        const totalStudents = sortedScores.length;

        const gradeRules = await GradeRule.findAll({ where: { schoolId } });

        const getGrade = (percentage) => {
            const rule = gradeRules.find(r => percentage >= r.minPercentage && percentage <= r.maxPercentage);
            return rule ? rule.grade : '-';
        };

        let hasFailed = false;
        const subjectDetails = results.map(r => {
            const p = (r.marksObtained / r.maxMarks) * 100;
            const grade = getGrade(p);
            if (grade === 'F') hasFailed = true;
            return {
                ...r.toJSON(),
                percentage: p.toFixed(1),
                grade
            };
        });

        const totalMarksObtained = results.reduce((sum, r) => sum + r.marksObtained, 0);
        const totalMaxMarks = results.reduce((sum, r) => sum + r.maxMarks, 0);
        const overallPercentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2) : 0;

        let overallGrade = getGrade(parseFloat(overallPercentage));
        if (hasFailed) overallGrade = 'F';

        // Get protocol and host for image URLs
        const protocol = req.protocol;
        const host = req.get('host');

        // Generate HTML using template
        const htmlContent = generateReportCardTemplate(
            student,
            exam,
            subjectDetails,
            student.School,
            rank,
            totalStudents,
            overallPercentage,
            overallGrade,
            protocol,
            host
        );

        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true }); // reduce margin and padding
        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename="ReportCard_${student.admissionNumber}.pdf"`,
        });

        res.send(pdfBuffer);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
