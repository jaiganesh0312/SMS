const express = require("express");
const morgan = require("morgan");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");

const { sequelize } = require("./config/database");

dotenv.config();

const app = express();
const { initSocketServer } = require("./config/socketServer"); // Import socket init
const server = http.createServer(app); // Create HTTP server

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://btp9hpfw-5173.inc1.devtunnels.ms"],
  credentials: true,
}));
app.use(morgan("dev"));
app.use(cookieParser());



app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/authRoutes");
const academicRoutes = require("./routes/academicRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const examRoutes = require("./routes/examRoutes");
const financeRoutes = require("./routes/financeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const studentRoutes = require("./routes/studentRoutes");
const parentRoutes = require("./routes/parentRoutes");
const bulkUploadRoutes = require("./routes/bulkUploadRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const chatRoutes = require("./routes/chatRoutes"); // Import chat routes

app.use("/api/auth", authRoutes);
app.use("/api/academics", academicRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/upload", bulkUploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/staff-attendance", require("./routes/staffAttendanceRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));
app.use("/api/school", require("./routes/schoolRoutes"));
app.use("/api/library", require("./routes/libraryRoutes"));
app.use("/api/chat", chatRoutes); // Use chat routes
app.use("/api/transport", require("./routes/transportRoutes")); // Transport/Bus tracking routes


// 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    error: "Endpoint not found"
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = 5000;


server.listen(PORT, async () => {
  await sequelize.authenticate();
  console.log("Database connected successfully");
  await sequelize.sync({ alter: true });
  console.log("Database synced successfully");

  // Initialize Socket.IO
  initSocketServer(server);
  console.log("Socket.IO Initialized");

  console.log("Server Running on localhost 5000");
});


module.exports = app;
