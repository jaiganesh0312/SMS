const express = require("express");
const financeController = require("../controllers/financeController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { restrictToFeeCollection } = require("../middlewares/financeMiddleware");
const { createFeeStructureValidator, collectFeeValidator, createPayrollValidator } = require("../middlewares/validators");

const router = express.Router();

router.use(protect);

// Fees
router.post("/fees", restrictToFeeCollection, createFeeStructureValidator, financeController.createFeeStructure);
router.get("/fees", financeController.getFeeStructures);
router.post("/fees/collect", restrictToFeeCollection, collectFeeValidator, financeController.collectFee);
router.get("/receipt/:paymentId", restrictToFeeCollection, financeController.generateFeeReceipt);
router.get("/receipts", restrictToFeeCollection, financeController.getReceipts);

// Fee Statistics and Tracking
router.get("/statistics", restrictToFeeCollection, financeController.getFeeStatistics);
router.get("/class/:classId/students", restrictToFeeCollection, financeController.getClassFeeStatus);
router.get("/student/:studentId/fees", financeController.getStudentFeeDetails); // Accessible by admin and parent

// Parent Payment
router.post("/payment", restrictTo("PARENT"), financeController.processPayment);

// Payroll
router.post("/payroll", restrictTo("SCHOOL_ADMIN"), createPayrollValidator, financeController.createPayrollRecord);

module.exports = router;

