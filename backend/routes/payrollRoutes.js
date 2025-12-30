const express = require("express");
const payrollController = require("../controllers/payrollController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("SCHOOL_ADMIN", "SUPER_ADMIN"));
// Routes
router.post("/structure", payrollController.upsertSalaryStructure);
router.get("/structure/:staffId", payrollController.getSalaryStructure);
router.post("/generate", payrollController.generatePayroll); // Generate for all or list
router.get("/list", payrollController.getPayrolls); // New route
router.get("/payslip/:id", payrollController.getPayslip);

module.exports = router;
