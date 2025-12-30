const { sequelize, Sequelize } = require("../config/database");

const School = require("./School");
const User = require("./User");
const Parent = require("./Parent");
const Student = require("./Student");
const Class = require("./Class");
const Subject = require("./Subject");
const Timetable = require("./Timetable");
const Attendance = require("./Attendance");
const Leave = require("./Leave");
const Exam = require("./Exam");
const ExamResult = require("./ExamResult");
const GradeRule = require("./GradeRule");
const FeeStructure = require("./FeeStructure");
const FeePayment = require("./FeePayment");
const Payroll = require("./Payroll");
const Notification = require("./Notification");
const StaffProfile = require("./StaffProfile");
const Announcement = require("./Announcement");
const StaffAttendance = require("./StaffAttendance");
const SalaryStructure = require("./SalaryStructure");
const Complaint = require("./Complaint");
const Gallery = require("./Gallery");
const GalleryImage = require("./GalleryImage");
const Book = require("./Book");
const LibrarySection = require("./LibrarySection");
const LibraryTransaction = require("./LibraryTransaction");
const Conversation = require("./Conversation");
const Message = require("./Message");

// School Associations
School.hasMany(User, { foreignKey: "schoolId" });
User.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(Student, { foreignKey: "schoolId" });
Student.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(Class, { foreignKey: "schoolId" });
Class.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(Subject, { foreignKey: "schoolId" });
Subject.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(Attendance, { foreignKey: "schoolId" });
Attendance.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(Leave, { foreignKey: "schoolId" });
Leave.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(Exam, { foreignKey: "schoolId" }); // Exam linked to School
Exam.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(GradeRule, { foreignKey: "schoolId" });
GradeRule.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(FeeStructure, { foreignKey: "schoolId" });
FeeStructure.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(Payroll, { foreignKey: "schoolId" });
Payroll.belongsTo(School, { foreignKey: "schoolId" });

// User Associations
User.hasOne(Parent, { foreignKey: "userId" });
Parent.belongsTo(User, { foreignKey: "userId" });

User.hasOne(StaffProfile, { foreignKey: "userId" });
StaffProfile.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Leave, { foreignKey: "applicantId" });
Leave.belongsTo(User, { foreignKey: "applicantId" });

User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

// Parent-Student Associations
Parent.hasMany(Student, { foreignKey: "parentId" });
Student.belongsTo(Parent, { foreignKey: "parentId" });

// Academic Associations
Class.hasMany(Timetable, { foreignKey: "classId" });
Timetable.belongsTo(Class, { foreignKey: "classId" });

Subject.hasMany(Timetable, { foreignKey: "subjectId" });
Timetable.belongsTo(Subject, { foreignKey: "subjectId" });

User.hasMany(Timetable, { foreignKey: "teacherId" }); // User as Teacher
Timetable.belongsTo(User, { foreignKey: "teacherId" });

// Attendance Associations
Student.hasMany(Attendance, { foreignKey: "studentId" });
Attendance.belongsTo(Student, { foreignKey: "studentId" });

Class.hasMany(Attendance, { foreignKey: "classId" }); // Optional link
Attendance.belongsTo(Class, { foreignKey: "classId" });

// Exam Associations
Class.hasMany(Exam, { foreignKey: "classId" });
Exam.belongsTo(Class, { foreignKey: "classId" });

Exam.hasMany(ExamResult, { foreignKey: "examId" });
ExamResult.belongsTo(Exam, { foreignKey: "examId" });

Student.hasMany(ExamResult, { foreignKey: "studentId" });
ExamResult.belongsTo(Student, { foreignKey: "studentId" });

Subject.hasMany(ExamResult, { foreignKey: "subjectId" });
ExamResult.belongsTo(Subject, { foreignKey: "subjectId" });

Student.belongsTo(Class, { foreignKey: "classId" });
Class.hasMany(Student, { foreignKey: "classId" });

// Finance Associations
Class.hasMany(FeeStructure, { foreignKey: "classId" });
FeeStructure.belongsTo(Class, { foreignKey: "classId" });

FeeStructure.hasMany(FeePayment, { foreignKey: "feeStructureId" });
FeePayment.belongsTo(FeeStructure, { foreignKey: "feeStructureId" });

Student.hasMany(FeePayment, { foreignKey: "studentId" });
FeePayment.belongsTo(Student, { foreignKey: "studentId" });

School.hasMany(FeePayment, { foreignKey: "schoolId" });
FeePayment.belongsTo(School, { foreignKey: "schoolId" });

StaffProfile.hasMany(Payroll, { foreignKey: "staffId" });
Payroll.belongsTo(StaffProfile, { foreignKey: "staffId" });

StaffProfile.hasMany(StaffAttendance, { foreignKey: "staffId" });
StaffAttendance.belongsTo(StaffProfile, { foreignKey: "staffId" });

StaffProfile.hasOne(SalaryStructure, { foreignKey: "staffId" });
SalaryStructure.belongsTo(StaffProfile, { foreignKey: "staffId" });

School.hasMany(StaffAttendance, { foreignKey: "schoolId" });
StaffAttendance.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(SalaryStructure, { foreignKey: "schoolId" });
SalaryStructure.belongsTo(School, { foreignKey: "schoolId" });

// Announcement Associations
User.hasMany(Announcement, { foreignKey: "authorId", as: "announcements" });
Announcement.belongsTo(User, { foreignKey: "authorId", as: "author" });

School.hasMany(Announcement, { foreignKey: "schoolId" });
Announcement.belongsTo(School, { foreignKey: "schoolId", as: "school" });

Class.hasMany(Announcement, { foreignKey: "classId" });
Announcement.belongsTo(Class, { foreignKey: "classId", as: "class" });

// Class Teacher Association
Class.belongsTo(User, { foreignKey: "classTeacherId", as: "classTeacher" });
User.hasOne(Class, { foreignKey: "classTeacherId", as: "classTeacherOf" });

// Complaint Associations
School.hasMany(Complaint, { foreignKey: "schoolId" });
Complaint.belongsTo(School, { foreignKey: "schoolId" });

Parent.hasMany(Complaint, { foreignKey: "parentId" });
Complaint.belongsTo(Parent, { foreignKey: "parentId" });


// Gallery Associations
School.hasMany(Gallery, { foreignKey: "schoolId" });
Gallery.belongsTo(School, { foreignKey: "schoolId" });

Gallery.hasMany(GalleryImage, { foreignKey: "galleryId", as: "images" });
GalleryImage.belongsTo(Gallery, { foreignKey: "galleryId" });

// Library Associations
School.hasMany(LibrarySection, { foreignKey: "schoolId" });
LibrarySection.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(Book, { foreignKey: "schoolId" });
Book.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(LibraryTransaction, { foreignKey: "schoolId" });
LibraryTransaction.belongsTo(School, { foreignKey: "schoolId" });

LibrarySection.hasMany(Book, { foreignKey: "sectionId" });
Book.belongsTo(LibrarySection, { foreignKey: "sectionId" });

Book.hasMany(LibraryTransaction, { foreignKey: "bookId" });
LibraryTransaction.belongsTo(Book, { foreignKey: "bookId" });

User.hasMany(LibraryTransaction, { foreignKey: "userId" });
LibraryTransaction.belongsTo(User, { foreignKey: "userId" });

Student.hasMany(LibraryTransaction, { foreignKey: "studentId" });
Student.hasMany(LibraryTransaction, { foreignKey: "studentId" });
LibraryTransaction.belongsTo(Student, { foreignKey: "studentId" });

// Chat Associations
School.hasMany(Conversation, { foreignKey: "schoolId" });
Conversation.belongsTo(School, { foreignKey: "schoolId" });

User.hasMany(Conversation, { foreignKey: "userAId", as: "conversationsA" });
Conversation.belongsTo(User, { foreignKey: "userAId", as: "userA" });

User.hasMany(Conversation, { foreignKey: "userBId", as: "conversationsB" });
Conversation.belongsTo(User, { foreignKey: "userBId", as: "userB" });

Conversation.hasMany(Message, { foreignKey: "conversationId" });
Message.belongsTo(Conversation, { foreignKey: "conversationId" });

User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });

User.hasMany(Message, { foreignKey: "receiverId", as: "receivedMessages" });
Message.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

module.exports = {
  sequelize,
  Sequelize,
  School,
  User,
  Parent,
  Student,
  StaffProfile,
  Class,
  Subject,
  Timetable,
  Attendance,
  Leave,
  Exam,
  ExamResult,
  GradeRule,
  FeeStructure,
  FeePayment,
  Payroll,
  Notification,
  Notification,
  Announcement,
  StaffAttendance,
  SalaryStructure,
  Complaint,
  Gallery,
  GalleryImage,
  Book,
  Book,
  LibrarySection,
  LibraryTransaction,
  Conversation,
  Message,
};
