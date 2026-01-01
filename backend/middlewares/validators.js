const { body, validationResult } = require("express-validator");

// Utility to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(". ");
    return res.status(400).json({
      success: false,
      message: `Validation Error: ${errorMessages}`,
    });
  }
  next();
};

exports.registerSchoolValidator = [
  body("schoolName").notEmpty().withMessage("School name is required"),
  body("schoolAddress").optional().isString(),
  body("schoolBoard").optional().isString(),
  body("adminEmail").isEmail().withMessage("Valid admin email is required"),
  body("adminPhone").optional().isMobilePhone().withMessage("Valid phone number is required"),
  body("adminPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("adminName").optional().isString(),
  validate,
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

exports.createClassValidator = [
  body("name").notEmpty().withMessage("Class name is required"),
  body("section").notEmpty().withMessage("Section is required"),
  validate,
];

exports.createSubjectValidator = [
  body("name").notEmpty().withMessage("Subject name is required"),
  body("code").optional().isString(),
  validate,
];

exports.createTimetableValidator = [
  body("classId").isUUID().withMessage("Valid Class ID required"),
  body("subjectId").isUUID().withMessage("Valid Subject ID required"),
  body("teacherId").isUUID().withMessage("Valid Teacher ID required"),
  body("dayOfWeek")
    .trim()
    .customSanitizer((value, { req }) => {
      // Fallback to 'day' field if 'dayOfWeek' is empty/missing
      const dayValue = value || req.body.day;

      if (typeof dayValue === 'string' && dayValue.length > 0) {
        return dayValue.charAt(0).toUpperCase() + dayValue.slice(1).toLowerCase();
      }
      return dayValue;
    })
    .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]).withMessage("Invalid day"),
  body("startTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Start time must be HH:MM"),
  body("endTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("End time must be HH:MM"),
  body("room").optional().isString().withMessage("Room must be a string"),
  validate
];

exports.markAttendanceValidator = [
  body("classId").isUUID().withMessage("Class ID is required"),
  body("date").isISO8601().toDate().withMessage("Valid date is required"),
  // Check either 'students' OR 'attendance' is present and is an array
  body()
    .custom((value, { req }) => {
      const list = req.body.students || req.body.attendance;
      if (!list || !Array.isArray(list) || list.length === 0) {
        throw new Error("Students/Attendance array is required");
      }
      // Normalize to req.body.students for subsequent validators/controllers
      req.body.students = list;
      return true;
    }),
  body("students.*.studentId").isUUID().withMessage("Valid Student ID required"),
  body("students.*.status").isIn(["PRESENT", "ABSENT", "LATE", "HALF_DAY"]).withMessage("Invalid status"),
  validate
];

exports.createExamValidator = [
  body("classId").isUUID().withMessage("Valid Class ID required"),
  body("name").notEmpty().withMessage("Exam name is required"),
  body("type").isIn(["UNIT_TEST", "HALF_YEARLY", "FINAL", "OTHER"]).withMessage("Invalid exam type"),
  body("startDate").isDate().withMessage("Valid start date required"),
  body("endDate").isDate().withMessage("Valid end date required"),
  validate
];

exports.addExamResultValidator = [
  body("examId").isUUID().withMessage("Exam ID is required"),
  body("subjectId").isUUID().withMessage("Subject ID is required"),
  body("results").isArray({ min: 1 }).withMessage("Results array is required"),
  body("results.*.studentId").isUUID().withMessage("Valid Student ID required"),
  body("results.*.marksObtained").isFloat({ min: 0 }).withMessage("Marks invalid"),
  validate
];

exports.createFeeStructureValidator = [
  body("classId").isUUID().withMessage("Valid Class ID required"),
  body("name").notEmpty().withMessage("Fee name is required"),
  body("amount").isFloat({ min: 0 }).withMessage("Valid amount is required"),
  body("frequency").isIn(["MONTHLY", "YEARLY", "ONE_TIME", "QUARTERLY"]).withMessage("Invalid frequency"),
  validate
];

exports.collectFeeValidator = [
  body("studentId").isUUID().withMessage("Student ID is required"),
  body("feeStructureId").isUUID().withMessage("Fee Structure ID is required"),
  body("amountPaid")
    .customSanitizer((value, { req }) => {
      return value !== undefined ? value : req.body.amount;
    })
    .isFloat({ min: 0 }).withMessage("Valid amount paid is required"),
  body("paymentMethod").isIn(["CASH", "ONLINE", "CHEQUE"]).withMessage("Invalid payment method"),
  validate
];

exports.createPayrollValidator = [
  body("staffId").isUUID().withMessage("Staff ID is required"),
  body("month").notEmpty().withMessage("Month is required"),
  body("year").isInt({ min: 2000 }).withMessage("Valid year is required"),
  body("basicSalary").isFloat({ min: 0 }).withMessage("Valid basic salary required"),
  validate
];
