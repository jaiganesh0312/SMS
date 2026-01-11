const { FeeStructure, FeePayment, Student, Class, Payroll, StaffProfile, User, Parent, School } = require("../models");
const { Op } = require("sequelize");
const puppeteer = require('puppeteer');
const generateFeeReceiptTemplate = require('../utils/feeReceiptTemplate');
const { sendFeePaymentReceiptEmail } = require('../services/emailService');

// --- Fee Management ---
exports.createFeeStructure = async (req, res) => {
    try {
        const { classId, name, amount, frequency } = req.body;
        const schoolId = req.user.schoolId;

        const fee = await FeeStructure.create({
            schoolId, classId, name, amount, frequency
        });

        res.status(201).json({
            success: true,
            message: "Fee structure created successfully",
            data: { fee }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getFeeStructures = async (req, res) => {
    try {
        const { classId } = req.query;
        const schoolId = req.user.schoolId;

        const where = { schoolId };
        if (classId) where.classId = classId;

        const fees = await FeeStructure.findAll({ where });

        res.status(200).json({
            success: true,
            message: "Fee structures fetched successfully",
            results: fees.length,
            data: { fees }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.collectFee = async (req, res) => {
    try {
        const { studentId, feeStructureId, amountPaid, paymentMethod, transactionId } = req.body;
        const schoolId = req.user.schoolId;

        const payment = await FeePayment.create({
            schoolId, studentId, feeStructureId, amountPaid, paymentMethod, transactionId
        });

        res.status(201).json({
            success: true,
            message: "Fee collected successfully",
            data: { payment }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Fee Statistics for School Admin Dashboard
exports.getFeeStatistics = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;

        // Get all classes for the school
        const classes = await Class.findAll({
            where: { schoolId },
            attributes: ['id', 'name']
        });

        // Get all fee structures for the school
        const feeStructures = await FeeStructure.findAll({
            where: { schoolId },
            include: [{ model: Class, attributes: ['id', 'name'] }]
        });

        // Get all students with their class
        const students = await Student.findAll({
            where: { schoolId },
            include: [{ model: Class, attributes: ['id', 'name'] }]
        });

        // Calculate statistics by class
        const classStats = await Promise.all(classes.map(async (classItem) => {
            // Get fee structures for this class
            const classFees = feeStructures.filter(fs => fs.classId === classItem.id);
            const totalFeeAmount = classFees.reduce((sum, fee) => sum + Number(fee.amount), 0);

            // Get students in this class
            const classStudents = students.filter(s => s.classId === classItem.id);
            const studentCount = classStudents.length;

            // Calculate total collectible (fee amount * number of students)
            const totalCollectible = totalFeeAmount * studentCount;

            // Get all payments for students in this class
            const payments = await FeePayment.findAll({
                where: {
                    schoolId,
                    studentId: classStudents.map(s => s.id)
                }
            });

            const totalCollected = payments.reduce((sum, payment) => sum + Number(payment.amountPaid), 0);
            const totalPending = totalCollectible - totalCollected;
            const collectionRate = totalCollectible > 0 ? ((totalCollected / totalCollectible) * 100).toFixed(2) : 0;

            return {
                classId: classItem.id,
                className: `${classItem.name}`,
                studentCount,
                totalFees: totalCollectible,
                collectedAmount: totalCollected,
                pendingAmount: totalPending,
                collectionRate: parseFloat(collectionRate)
            };
        }));

        // Calculate overall statistics
        const overallStats = {
            totalFees: classStats.reduce((sum, stat) => sum + stat.totalFees, 0),
            totalCollected: classStats.reduce((sum, stat) => sum + stat.collectedAmount, 0),
            totalPending: classStats.reduce((sum, stat) => sum + stat.pendingAmount, 0),
            overallCollectionRate: 0
        };

        overallStats.overallCollectionRate = overallStats.totalFees > 0
            ? parseFloat(((overallStats.totalCollected / overallStats.totalFees) * 100).toFixed(2))
            : 0;

        res.status(200).json({
            success: true,
            message: "Fee statistics fetched successfully",
            data: {
                overview: overallStats,
                classSummary: classStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Class Fee Status - All students in a class with payment status
exports.getClassFeeStatus = async (req, res) => {
    try {
        const { classId } = req.params;
        const schoolId = req.user.schoolId;

        // Get class details
        const classDetails = await Class.findOne({
            where: { id: classId, schoolId }
        });

        if (!classDetails) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        // Get fee structures for this class
        const feeStructures = await FeeStructure.findAll({
            where: { classId, schoolId }
        });

        const totalFeePerStudent = feeStructures.reduce((sum, fee) => sum + Number(fee.amount), 0);

        // Get all students in this class
        const students = await Student.findAll({
            where: { classId, schoolId },
            attributes: ['id', 'admissionNumber', 'name']
        });

        // For each student, calculate payment status
        const studentPaymentStatus = await Promise.all(students.map(async (student) => {
            // Get all payments for this student
            const payments = await FeePayment.findAll({
                where: {
                    studentId: student.id,
                    schoolId
                },
                include: [{ model: FeeStructure, attributes: ['name', 'amount'] }]
            });

            const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amountPaid), 0);
            const pendingAmount = totalFeePerStudent - totalPaid;

            // Determine payment status
            let paymentStatus = 'PENDING';
            if (totalPaid === 0) {
                paymentStatus = 'PENDING';
            } else if (totalPaid >= totalFeePerStudent) {
                paymentStatus = 'PAID';
            } else {
                paymentStatus = 'PARTIAL';
            }

            return {
                studentId: student.id,
                admissionNumber: student.admissionNumber,
                studentName: student.name,
                totalFees: totalFeePerStudent,
                amountPaid: totalPaid,
                pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
                paymentStatus,
                lastPaymentDate: payments.length > 0 ? payments[payments.length - 1].paymentDate : null
            };
        }));

        res.status(200).json({
            success: true,
            message: "Class fee status fetched successfully",
            data: {
                classDetails: {
                    id: classDetails.id,
                    name: `${classDetails.name}`,
                    totalFeePerStudent
                },
                students: studentPaymentStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Student Fee Details - Detailed fee breakdown for a student
exports.getStudentFeeDetails = async (req, res) => {
    try {
        const { studentId } = req.params;
        const schoolId = req.user.schoolId;

        // Verify student belongs to this school (or parent has access)
        const student = await Student.findOne({
            where: { id: studentId, schoolId },
            include: [
                { model: Class, attributes: ['id', 'name'] },
                { model: require('../models').ClassSection, attributes: ['id', 'name'] },
                {
                    model: Parent, attributes: ['guardianName', 'id'],
                    include: [{ model: User, attributes: ['phone', 'email'] }]
                } // Added Parent Details
            ]
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // If user is a parent, verify they have access to this student
        if (req.user.role === 'PARENT') {
            const parent = await Parent.findOne({ where: { userId: req.user.id } });

            if (!parent || student.parentId !== parent.id) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view this student's fees"
                });
            }
        }

        // Get fee structures for student's class
        const feeStructures = await FeeStructure.findAll({
            where: { classId: student.classId, schoolId }
        });

        // Get all payments for this student
        const payments = await FeePayment.findAll({
            where: { studentId, schoolId },
            include: [{ model: FeeStructure, attributes: ['name', 'amount', 'frequency'] }],
            order: [['paymentDate', 'DESC']]
        });

        // Calculate fee breakdown
        const feeBreakdown = feeStructures.map(feeStructure => {
            const feePayments = payments.filter(p => p.feeStructureId === feeStructure.id);
            const totalPaid = feePayments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
            const pending = Number(feeStructure.amount) - totalPaid;

            return {
                feeStructureId: feeStructure.id,
                feeName: feeStructure.name,
                amount: Number(feeStructure.amount),
                frequency: feeStructure.frequency,
                totalPaid,
                pendingAmount: pending > 0 ? pending : 0,
                status: totalPaid === 0 ? 'PENDING' : (totalPaid >= Number(feeStructure.amount) ? 'PAID' : 'PARTIAL')
            };
        });

        const totalFees = feeStructures.reduce((sum, fs) => sum + Number(fs.amount), 0);
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);

        res.status(200).json({
            success: true,
            message: "Student fee details fetched successfully",
            data: {
                student: {
                    id: student.id,
                    name: student.name,
                    admissionNumber: student.admissionNumber,
                    class: student.Class ? `${student.Class.name} ${student.ClassSection ? '- ' + student.ClassSection.name : ''}` : 'N/A',
                    guardianName: student.Parent?.guardianName || 'N/A', // Send guardian info
                    contact: student.Parent?.User?.phone || 'N/A'
                },
                summary: {
                    totalFees,
                    totalPaid,
                    totalPending: totalFees - totalPaid
                },
                feeBreakdown,
                paymentHistory: payments.map(p => ({
                    id: p.id,
                    feeName: p.FeeStructure?.name,
                    amountPaid: Number(p.amountPaid),
                    paymentDate: p.paymentDate,
                    paymentMethod: p.paymentMethod,
                    transactionId: p.transactionId,
                    status: p.status
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Process Payment (Parent endpoint for dummy payment)
exports.processPayment = async (req, res) => {
    try {
        const { studentId, feeStructureId, amountPaid } = req.body;
        const schoolId = req.user.schoolId;

        // Verify the user is a parent and has access to this student
        const parent = await Parent.findOne({ where: { userId: req.user.id } });

        if (!parent) {
            return res.status(403).json({
                success: false,
                message: "Parent profile not found"
            });
        }

        // Verify student belongs to this parent
        const student = await Student.findOne({
            where: { id: studentId, parentId: parent.id, schoolId }
        });

        if (!student) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to make payment for this student"
            });
        }

        // Verify fee structure exists
        const feeStructure = await FeeStructure.findOne({
            where: { id: feeStructureId, schoolId }
        });

        if (!feeStructure) {
            return res.status(404).json({
                success: false,
                message: "Fee structure not found"
            });
        }

        // Create payment record (dummy payment - always SUCCESS)
        const payment = await FeePayment.create({
            schoolId,
            studentId,
            feeStructureId,
            amountPaid: Number(amountPaid),
            paymentMethod: 'ONLINE', // Dummy payment
            transactionId: `TXN${Date.now()}`, // Dummy transaction ID
            status: 'SUCCESS'
        });

        // Generate and Send Receipt Email
        const fullPayment = await FeePayment.findOne({
            where: { id: payment.id, schoolId },
            include: [
                {
                    model: Student,
                    include: [
                        {
                            model: Parent,
                            include: [{ model: User }]
                        },
                        { model: Class }
                    ]
                },
                { model: FeeStructure },
                { model: School }
            ]
        });

        if (fullPayment && fullPayment.Student && fullPayment.Student.Parent && fullPayment.Student.Parent.User) {
            const student = fullPayment.Student;
            const feeDesc = fullPayment.FeeStructure;
            const schoolInfo = fullPayment.School;
            const parentEmail = fullPayment.Student.Parent.User.email;

            // Generate PDF
            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            const htmlContent = generateFeeReceiptTemplate(fullPayment, student, feeDesc, schoolInfo, req.get('host'), req.protocol);
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
                format: 'A5',
                printBackground: true,
                margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }
            });
            await browser.close();

            // Send Email
            const schoolLogoUrl = schoolInfo.logo ? `${req.protocol}://${req.get('host')}/api/${schoolInfo.logo}` : null;
            await sendFeePaymentReceiptEmail(parentEmail, feeDesc.name, pdfBuffer, schoolInfo.name, schoolLogoUrl);
        }

        res.status(201).json({
            success: true,
            message: "Payment processed successfully",
            data: { payment }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// --- Payroll Management ---
exports.generatePayroll = async (req, res) => {
    try {
        const { month, year } = req.body;
        const schoolId = req.user.schoolId;

        // 1. Fetch all active staff
        const staffMembers = await StaffProfile.findAll({
            where: { schoolId },
            include: [{ model: User, where: { isActive: true } }]
        });

        // Re-implementation: Single Create
        return res.status(400).json({
            success: false,
            message: "Use /payroll/create for individual entry"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.createPayrollRecord = async (req, res) => {
    try {
        const { staffId, month, year, basicSalary, bonus, deductions } = req.body;
        const schoolId = req.user.schoolId;

        const netSalary = (Number(basicSalary) + Number(bonus || 0)) - Number(deductions || 0);

        const payroll = await Payroll.create({
            schoolId, staffId, month, year, basicSalary, bonus, deductions, netSalary
        });

        res.status(201).json({
            success: true,
            message: "Payroll record created successfully",
            data: { payroll }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// --- Fee Receipt Generation ---
exports.generateFeeReceipt = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const schoolId = req.user.schoolId;

        // Fetch payment details with associations
        const payment = await FeePayment.findOne({
            where: { id: paymentId, schoolId },
            include: [
                {
                    model: Student,
                    attributes: ['name', 'admissionNumber', 'profilePicture', 'parentId', 'classId'],
                    include: [
                        { model: Class, attributes: ['name'] },
                        { model: require('../models').ClassSection, attributes: ['name'] },
                        {
                            model: Parent,
                            attributes: ['guardianName', 'id'],
                            include: [{ model: User, attributes: ['phone', 'email'] }]
                        }
                    ]
                },
                { model: FeeStructure, attributes: ['name', 'amount', 'frequency'] },
                { model: School, attributes: ['name', 'address', 'logo'] }
            ]
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found"
            });
        }

        const student = payment.Student;
        const feeStructure = payment.FeeStructure;
        const school = payment.School || { name: 'School Name', address: 'School Address', logo: null };

        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Generate HTML
        const htmlContent = generateFeeReceiptTemplate(payment, student, feeStructure, school, req.get('host'), req.protocol);

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A5',
            printBackground: true,
            margin: {
                top: '15mm',
                bottom: '15mm',
                left: '15mm',
                right: '15mm'
            }
        });

        await browser.close();

        // Send PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment.transactionId || payment.id}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        } else {
            res.end();
        }
    }
};

// --- Get All Receipts ---
exports.getReceipts = async (req, res) => {
    try {
        const { studentId, limit, page } = req.query;
        const schoolId = req.user.schoolId;

        const whereClause = { schoolId, status: 'SUCCESS' };
        if (studentId) whereClause.studentId = studentId;

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const offset = (pageNum - 1) * limitNum;

        const { count, rows: payments } = await FeePayment.findAndCountAll({
            where: whereClause,
            include: [
                { model: Student, attributes: ['id', 'name', 'admissionNumber'] },
                { model: FeeStructure, attributes: ['id', 'name', 'amount'] }
            ],
            order: [['paymentDate', 'DESC']],
            limit: limitNum,
            offset: offset
        });

        res.status(200).json({
            success: true,
            message: "Receipts fetched successfully",
            data: {
                total: count,
                totalPages: Math.ceil(count / limitNum),
                currentPage: pageNum,
                receipts: payments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
