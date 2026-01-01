import { Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from '@/Providers';
import { AuthProvider } from '@/context/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { ErrorBoundary } from '@/components/common';

// Auth pages
import RegisterSchool from '@/pages/auth/RegisterSchool';
import Login from '@/pages/auth/Login';
import UpdatePassword from '@/pages/auth/UpdatePassword';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';

// Static Pages
import About from '@/pages/About';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';

// Student & Parent Pages
import StudentList from '@/pages/students/StudentList';
import ParentList from '@/pages/parents/ParentList';
import LinkStudentToParent from '@/pages/parents/LinkStudentToParent';
import CreateParent from '@/pages/parents/CreateParent';
import ChildDashboard from '@/pages/dashboard/ChildDashboard';
import BulkUploadPage from '@/pages/admin/BulkUploadPage';
import Schools from '@/pages/admin/Schools';
import SchoolSettings from '@/pages/admin/SchoolSettings';



// Academic Pages
import Classes from '@/pages/academic/Classes';
import Subjects from '@/pages/academic/Subjects';
import Timetable from '@/pages/academic/Timetable';
import CreateDailyTimetable from '@/pages/academic/CreateDailyTimetable';

// Attendance Pages
import MarkAttendance from '@/pages/attendance/MarkAttendance';
import AttendanceReport from '@/pages/attendance/AttendanceReport';

// Exam Pages
import ExamList from '@/pages/exams/ExamList';
import CreateExam from '@/pages/exams/CreateExam';
import ExamResults from '@/pages/exams/ExamResults';
import AddExamResult from '@/pages/exams/AddExamResult';
import ReportCard from '@/pages/exams/ReportCard';

// Finance Pages
import FeeStructure from '@/pages/finance/FeeStructure';
import Payroll from '@/pages/finance/Payroll';
import FeeStatistics from '@/pages/finance/FeeStatistics';
import ClassFeeDetails from '@/pages/finance/ClassFeeDetails';

import ChildFees from '@/pages/parents/ChildFees';
import CollectFees from '@/pages/finance/CollectFees';
import FeeReceipts from '@/pages/finance/FeeReceipts';

// Other Pages
import Notifications from '@/pages/Notifications';
import Announcements from '@/pages/Announcements';


// Staff & Leave Management
import StaffList from '@/pages/staff/StaffList';
import LeaveManagement from '@/pages/staff/LeaveManagement';
import StaffAttendance from '@/pages/staff/StaffAttendance';
import CreateStaff from '@/pages/staff/CreateStaff';
import PayrollManagement from '@/pages/staff/PayrollManagement';
import MyLeaves from '@/pages/staff/MyLeaves';
import OfferLetterAcceptance from '@/pages/staff/OfferLetterAcceptance';
import Complaints from '@/pages/complaints/Complaints';
import Gallery from '@/pages/gallery/Gallery';
import GalleryDetails from '@/pages/gallery/GalleryDetails';
import MyStudents from '@/pages/teacher/MyStudents';
import MyPeriods from '@/pages/teacher/MyPeriods';
import MyClassTimetable from '@/pages/teacher/MyClassTimetable';
import ChatPage from '@/pages/chat/ChatPage';

// Library Pages
import LibrarianDashboard from '@/pages/Librarian/LibrarianDashboard';
import ManageSections from '@/pages/Librarian/ManageSections';
import ManageBooks from '@/pages/Librarian/ManageBooks';
import IssueBook from '@/pages/Librarian/IssueBook';
import ReturnBook from '@/pages/Librarian/ReturnBook';
import RenewBook from '@/pages/Librarian/RenewBook';
import SectionBooks from '@/pages/Librarian/SectionBooks';
import BookDetails from '@/pages/Librarian/BookDetails';

// Transport Pages
import {
  BusTracking,
  ManageBuses,
  ManageRoutes,
  BusAssignments,
  DriverPanel,
  TripHistory,
} from '@/pages/transport';

// Study Material Pages
import StudyMaterials from '@/pages/study/StudyMaterials';
import SectionDetails from '@/pages/study/SectionDetails';
import VideoPlayer from '@/pages/study/VideoPlayer';



function App() {
  return (
    <Providers>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <MainLayout />
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="register-school" element={<ProtectedRoute><RegisterSchool /></ProtectedRoute>} />
              {/* Academic Routes */}
              <Route path="academic/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
              <Route path="academic/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
              <Route path="academic/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
              <Route path="academic/timetable/create-daily" element={<ProtectedRoute><CreateDailyTimetable /></ProtectedRoute>} />

              {/* Student & Parent Management (Admin) */}
              <Route path="students" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
              <Route path="parents" element={<ProtectedRoute><ParentList /></ProtectedRoute>} />
              <Route path="parents/:parentId/link-students" element={<ProtectedRoute><LinkStudentToParent /></ProtectedRoute>} />
              <Route path="register-parent" element={<ProtectedRoute><CreateParent /></ProtectedRoute>} />
              <Route path="admin/bulk-upload/:type" element={<ProtectedRoute><BulkUploadPage /></ProtectedRoute>} />
              <Route path="admin/schools" element={<ProtectedRoute><Schools /></ProtectedRoute>} />
              <Route path="school/settings" element={<ProtectedRoute><SchoolSettings /></ProtectedRoute>} />
              <Route path="settings/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />

              <Route path="parent/child/:studentId" element={<ProtectedRoute><ChildDashboard /></ProtectedRoute>} />

              {/* Attendance Routes */}
              <Route path="attendance/mark" element={<ProtectedRoute><MarkAttendance /></ProtectedRoute>} />
              <Route path="attendance/report" element={<ProtectedRoute><AttendanceReport /></ProtectedRoute>} />

              {/* Exam Routes */}
              <Route path="exams" element={<ProtectedRoute><ExamList /></ProtectedRoute>} />
              <Route path="exams/new" element={<ProtectedRoute><CreateExam /></ProtectedRoute>} />
              <Route path="exams/results" element={<ProtectedRoute><ExamResults /></ProtectedRoute>} />
              <Route path="exams/results/add" element={<ProtectedRoute><AddExamResult /></ProtectedRoute>} />
              <Route path="exams/reports" element={<ProtectedRoute><ReportCard /></ProtectedRoute>} />

              {/* Finance Routes */}
              <Route path="finance/statistics" element={<ProtectedRoute><FeeStatistics /></ProtectedRoute>} />
              <Route path="finance/class/:classId" element={<ProtectedRoute><ClassFeeDetails /></ProtectedRoute>} />
              <Route path="finance/fees" element={<ProtectedRoute><FeeStructure /></ProtectedRoute>} />
              <Route path="finance/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
              <Route path="finance/collect-fees" element={<ProtectedRoute><CollectFees /></ProtectedRoute>} />
              <Route path="finance/receipts" element={<ProtectedRoute><FeeReceipts /></ProtectedRoute>} />

              {/* Parent Fee Management */}
              <Route path="parent/fees" element={<ProtectedRoute><ChildFees /></ProtectedRoute>} />

              {/* Other Routes */}
              <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />

              {/* Staff & HR */}
              <Route path="staff" element={<ProtectedRoute><StaffList /></ProtectedRoute>} />
              <Route path="staff/create" element={<ProtectedRoute><CreateStaff /></ProtectedRoute>} />
              <Route path="staff/attendance" element={<ProtectedRoute><StaffAttendance /></ProtectedRoute>} />
              <Route path="staff/payroll" element={<ProtectedRoute><PayrollManagement /></ProtectedRoute>} />
              <Route path="leave-management" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
              <Route path="my-leaves" element={<ProtectedRoute><MyLeaves /></ProtectedRoute>} />
              <Route path="offer-letter" element={<ProtectedRoute><OfferLetterAcceptance /></ProtectedRoute>} />
              <Route path="complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
              <Route path="gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
              <Route path="gallery/:id" element={<ProtectedRoute><GalleryDetails /></ProtectedRoute>} />
              <Route path="teacher/my-students" element={<ProtectedRoute><MyStudents /></ProtectedRoute>} />
              <Route path="teacher/my-periods" element={<ProtectedRoute><MyPeriods /></ProtectedRoute>} />
              <Route path="teacher/my-class-timetable" element={<ProtectedRoute><MyClassTimetable /></ProtectedRoute>} />

              {/* Chat Route */}
              <Route path="chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

              {/* Library Management */}
              <Route path="library" element={<ProtectedRoute><LibrarianDashboard /></ProtectedRoute>} />
              <Route path="library/sections" element={<ProtectedRoute><ManageSections /></ProtectedRoute>} />
              <Route path="library/books" element={<ProtectedRoute><ManageBooks /></ProtectedRoute>} />
              <Route path="library/issue" element={<ProtectedRoute><IssueBook /></ProtectedRoute>} />
              <Route path="library/return" element={<ProtectedRoute><ReturnBook /></ProtectedRoute>} />
              <Route path="library/renew" element={<ProtectedRoute><RenewBook /></ProtectedRoute>} />
              <Route path="library/section/:sectionId/books" element={<ProtectedRoute><SectionBooks /></ProtectedRoute>} />
              <Route path="library/book/:id" element={<ProtectedRoute><BookDetails /></ProtectedRoute>} />

              {/* Transport / Bus Tracking */}
              <Route path="transport/tracking" element={<ProtectedRoute><BusTracking /></ProtectedRoute>} />
              <Route path="transport/buses" element={<ProtectedRoute><ManageBuses /></ProtectedRoute>} />
              <Route path="transport/routes" element={<ProtectedRoute><ManageRoutes /></ProtectedRoute>} />
              <Route path="transport/assignments" element={<ProtectedRoute><BusAssignments /></ProtectedRoute>} />
              <Route path="transport/driver-panel" element={<ProtectedRoute><DriverPanel /></ProtectedRoute>} />
              <Route path="transport/trip-history" element={<ProtectedRoute><TripHistory /></ProtectedRoute>} />

              {/* Study Materials Routes */}
              <Route path="study-materials" element={<ProtectedRoute><StudyMaterials /></ProtectedRoute>} />
              <Route path="study-materials/sections/:id" element={<ProtectedRoute><SectionDetails /></ProtectedRoute>} />
              <Route path="study-materials/video/:id" element={<ProtectedRoute><VideoPlayer /></ProtectedRoute>} />



              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Catch all */}
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </Providers>
  );
}

export default App;
