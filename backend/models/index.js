const { sequelize, Sequelize } = require("../config/database");

const School = require("./School");
const User = require("./User");
const Parent = require("./Parent");
const Student = require("./Student");
const Class = require("./Class");
const ClassSection = require("./ClassSection");
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

// Study Material Models
const StudyMaterialSection = require("./StudyMaterialSection");
const StudyMaterial = require("./StudyMaterial");

// Transport Models
const Bus = require("./Bus");
const BusRoute = require("./BusRoute");
const BusTrip = require("./BusTrip");
const BusLocation = require("./BusLocation");
const StudentBusAssignment = require("./StudentBusAssignment");

// School Associations
School.hasMany(User, { foreignKey: "schoolId" });
User.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(Student, { foreignKey: "schoolId" });
Student.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(Class, { foreignKey: "schoolId" });
School.hasMany(Class, { foreignKey: "schoolId" });
Class.belongsTo(School, { foreignKey: "schoolId" });

School.hasMany(ClassSection, { foreignKey: "schoolId" });
ClassSection.belongsTo(School, { foreignKey: "schoolId" });

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
Class.hasMany(Timetable, { foreignKey: "classId" });
Timetable.belongsTo(Class, { foreignKey: "classId" });

ClassSection.hasMany(Timetable, { foreignKey: "sectionId" });
Timetable.belongsTo(ClassSection, { foreignKey: "sectionId" });

Subject.hasMany(Timetable, { foreignKey: "subjectId" });
Timetable.belongsTo(Subject, { foreignKey: "subjectId" });

Class.hasMany(Subject, { foreignKey: "classId" });
Subject.belongsTo(Class, { foreignKey: "classId" });

User.hasMany(Timetable, { foreignKey: "teacherId" }); // User as Teacher
Timetable.belongsTo(User, { foreignKey: "teacherId" });

// Attendance Associations
Student.hasMany(Attendance, { foreignKey: "studentId" });
Attendance.belongsTo(Student, { foreignKey: "studentId" });

ClassSection.hasMany(Attendance, { foreignKey: "sectionId" });
Attendance.belongsTo(ClassSection, { foreignKey: "sectionId" });

// Exam Associations
Class.hasMany(Exam, { foreignKey: "classId" });
Exam.belongsTo(Class, { foreignKey: "classId" });

// Exams might be specific to a section? Usually exams are for the whole class, but results are per student (who is in a section).
// If exams need to be per section, add:
ClassSection.hasMany(Exam, { foreignKey: "sectionId" });
Exam.belongsTo(ClassSection, { foreignKey: "sectionId" });

Exam.hasMany(ExamResult, { foreignKey: "examId" });
ExamResult.belongsTo(Exam, { foreignKey: "examId" });

Student.hasMany(ExamResult, { foreignKey: "studentId" });
ExamResult.belongsTo(Student, { foreignKey: "studentId" });

Subject.hasMany(ExamResult, { foreignKey: "subjectId" });
ExamResult.belongsTo(Subject, { foreignKey: "subjectId" });

Student.belongsTo(Class, { foreignKey: "classId" });
Student.belongsTo(Class, { foreignKey: "classId" });
Class.hasMany(Student, { foreignKey: "classId" });

Student.belongsTo(ClassSection, { foreignKey: "sectionId" });
ClassSection.hasMany(Student, { foreignKey: "sectionId" });

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
// Class Teacher (Now on ClassSection)
ClassSection.belongsTo(User, { foreignKey: "classTeacherId", as: "classTeacher" });
User.hasMany(ClassSection, { foreignKey: "classTeacherId", as: "classTeacherOf" });

// Class -> Sections logic
Class.hasMany(ClassSection, { foreignKey: "classId" });
ClassSection.belongsTo(Class, { foreignKey: "classId" });

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

// Transport Associations
School.hasMany(Bus, { foreignKey: "schoolId" });
Bus.belongsTo(School, { foreignKey: "schoolId" });

User.hasMany(Bus, { foreignKey: "driverId", as: "assignedBuses" });
Bus.belongsTo(User, { foreignKey: "driverId", as: "driver" });

Bus.hasMany(BusRoute, { foreignKey: "busId" });
BusRoute.belongsTo(Bus, { foreignKey: "busId" });

School.hasMany(BusRoute, { foreignKey: "schoolId" });
BusRoute.belongsTo(School, { foreignKey: "schoolId" });

Bus.hasMany(BusTrip, { foreignKey: "busId" });
BusTrip.belongsTo(Bus, { foreignKey: "busId" });

BusRoute.hasMany(BusTrip, { foreignKey: "routeId" });
BusTrip.belongsTo(BusRoute, { foreignKey: "routeId" });

School.hasMany(BusTrip, { foreignKey: "schoolId" });
BusTrip.belongsTo(School, { foreignKey: "schoolId" });

Bus.hasMany(BusLocation, { foreignKey: "busId" });
BusLocation.belongsTo(Bus, { foreignKey: "busId" });

BusTrip.hasMany(BusLocation, { foreignKey: "tripId" });
BusLocation.belongsTo(BusTrip, { foreignKey: "tripId" });

Student.hasOne(StudentBusAssignment, { foreignKey: "studentId" });
StudentBusAssignment.belongsTo(Student, { foreignKey: "studentId" });

Bus.hasMany(StudentBusAssignment, { foreignKey: "busId" });
StudentBusAssignment.belongsTo(Bus, { foreignKey: "busId" });

BusRoute.hasMany(StudentBusAssignment, { foreignKey: "routeId" });
StudentBusAssignment.belongsTo(BusRoute, { foreignKey: "routeId" });

School.hasMany(StudentBusAssignment, { foreignKey: "schoolId" });
StudentBusAssignment.belongsTo(School, { foreignKey: "schoolId" });

// Study Material Associations
School.hasMany(StudyMaterialSection, { foreignKey: "schoolId" });
StudyMaterialSection.belongsTo(School, { foreignKey: "schoolId" });

Class.hasMany(StudyMaterialSection, { foreignKey: "classId" });
Class.hasMany(StudyMaterialSection, { foreignKey: "classId" });
StudyMaterialSection.belongsTo(Class, { foreignKey: "classId" });

ClassSection.hasMany(StudyMaterialSection, { foreignKey: "sectionId" });
StudyMaterialSection.belongsTo(ClassSection, { foreignKey: "sectionId" });

Subject.hasMany(StudyMaterialSection, { foreignKey: "subjectId" });
StudyMaterialSection.belongsTo(Subject, { foreignKey: "subjectId" });

User.hasMany(StudyMaterialSection, { foreignKey: "createdBy", as: "createdSections" });
StudyMaterialSection.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

StudyMaterialSection.hasMany(StudyMaterial, { foreignKey: "studyMaterialSectionId", as: "materials" });
StudyMaterial.belongsTo(StudyMaterialSection, { foreignKey: "studyMaterialSectionId", as: "section" });

School.hasMany(StudyMaterial, { foreignKey: "schoolId" });
StudyMaterial.belongsTo(School, { foreignKey: "schoolId" });

User.hasMany(StudyMaterial, { foreignKey: "uploadedBy", as: "uploadedMaterials" });
StudyMaterial.belongsTo(User, { foreignKey: "uploadedBy", as: "uploader" });


module.exports = {
  sequelize,
  Sequelize,
  School,
  User,
  Parent,
  Student,
  StaffProfile,
  Class,
  ClassSection,
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
  Announcement,
  StaffAttendance,
  SalaryStructure,
  Complaint,
  Gallery,
  GalleryImage,
  Book,
  LibrarySection,
  LibraryTransaction,
  Conversation,
  Message,
  // Study Materials
  StudyMaterialSection,
  StudyMaterial,
  // Transport
  Bus,
  BusRoute,
  BusTrip,
  BusLocation,
  StudentBusAssignment,
};
