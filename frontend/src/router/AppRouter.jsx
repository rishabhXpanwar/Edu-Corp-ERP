import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import ForbiddenPage from './ForbiddenPage.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import RoleGuard from './RoleGuard.jsx';

// Layouts — imported when created in STEP 10
import PublicLayout from '../layouts/PublicLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
// import SuperAdminLayout from '../layouts/SuperAdminLayout.jsx';

// Feature pages are imported as components are built.
import LoginPage from '../features/auth/LoginPage.jsx';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../features/auth/ResetPasswordPage.jsx';
import LandingPage from '../features/landing/LandingPage.jsx';

import SuperAdminLayout from '../layouts/SuperAdminLayout.jsx';
import SaDashboardPage from '../features/superadmin/SaDashboardPage.jsx';
import SchoolsListPage from '../features/superadmin/SchoolsListPage.jsx';
import SchoolDetailPage from '../features/superadmin/SchoolDetailPage.jsx';
import SubscriptionsListPage from '../features/superadmin/SubscriptionsListPage.jsx';
import SubscriptionDetailPage from '../features/superadmin/SubscriptionDetailPage.jsx';
import ProfilePage from '../features/profile/ProfilePage.jsx';
import ClassesPage from '../features/classes/ClassesPage.jsx';
import StudentsListPage from '../features/students/StudentsListPage.jsx';
import StudentAdmissionPage from '../features/students/StudentAdmissionPage.jsx';
import StudentDetailPage from '../features/students/StudentDetailPage.jsx';
import TeachersPage from '../features/teachers/TeachersPage.jsx';
import TeacherDetailPage from '../features/teachers/TeacherDetailPage.jsx';
import ManagersPage from '../features/managers/ManagersPage.jsx';
import AttendancePage from '../features/attendance/AttendancePage.jsx';
import TimetablePage from '../features/timetable/TimetablePage.jsx';
import ExamsPage from '../features/exams/ExamsPage.jsx';
import MarksPage from '../features/marks/MarksPage.jsx';
import ResultsPage from '../features/results/ResultsPage.jsx';
import ReportCardsPage from '../features/reportCards/ReportCardsPage.jsx';
import AssignmentsPage from '../features/assignments/AssignmentsPage.jsx';
import FeesPage from '../features/fees/FeesPage.jsx';
import SalariesPage from '../features/salaries/SalariesPage.jsx';
import LeavePage from '../features/leave/LeavePage.jsx';
import LibraryPage from '../features/library/LibraryPage.jsx';
import TransportPage from '../features/transport/TransportPage.jsx';
import NotificationsPage from '../features/notifications/NotificationsPage.jsx';
import AnnouncementsPage from '../features/announcements/AnnouncementsPage.jsx';
import CalendarPage from '../features/calendar/CalendarPage.jsx';
import DashboardPage from '../features/dashboard/DashboardPage.jsx';
import AuditPage from '../features/audit/AuditPage.jsx';
import SettingsPage from '../features/settings/SettingsPage.jsx';
// Each COMP-XX-FE adds its import and route entry below.

const router = createBrowserRouter([
  // Authorized routes — SuperAdmin
  {
    path: '/superadmin',
    element: (
      <RoleGuard allowedRoles={['superAdmin']}>
        <SuperAdminLayout />
      </RoleGuard>
    ),
    children: [
      { path: 'dashboard', element: <SaDashboardPage /> },
      { path: 'schools', element: <SchoolsListPage /> },
      { path: 'schools/:id', element: <SchoolDetailPage /> },
      { path: 'subscriptions', element: <SubscriptionsListPage /> },
      { path: 'subscriptions/:id', element: <SubscriptionDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ]
  },
  
  // Authorized routes — Tenant Schools (Principals, Teachers, etc.)
  // Public routes — no auth required
  { path: '/', element: <PublicLayout><LandingPage /></PublicLayout> },
  { path: '/login', element: <PublicLayout><LoginPage /></PublicLayout> },
  { path: '/forgot-password', element: <PublicLayout><ForgotPasswordPage /></PublicLayout> },
  { path: '/reset-password', element: <PublicLayout><ResetPasswordPage /></PublicLayout> },

  // School panel routes — inside ProtectedRoute
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AuthLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { 
        path: 'classes', 
        element: (
          <RoleGuard allowedRoles={['principal', 'academicManager']}>
            <ClassesPage />
          </RoleGuard>
        ) 
      },
      {
        path: 'students',
        element: (
          <RoleGuard allowedRoles={['principal', 'academicManager', 'adminManager', 'teacher']}>
            <StudentsListPage />
          </RoleGuard>
        )
      },
      {
        path: 'students/new',
        element: (
          <RoleGuard allowedRoles={['principal', 'adminManager']}>
            <StudentAdmissionPage />
          </RoleGuard>
        )
      },
      {
        path: 'students/:id',
        element: (
          <RoleGuard allowedRoles={['principal', 'academicManager', 'adminManager', 'teacher']}>
            <StudentDetailPage />
          </RoleGuard>
        )
      },
      {
        path: 'teachers',
        element: (
          <RoleGuard allowedRoles={['principal', 'hrManager', 'academicManager']}>
            <TeachersPage />
          </RoleGuard>
        )
      },
      {
        path: 'teachers/:id',
        element: (
          <RoleGuard allowedRoles={['principal', 'hrManager', 'academicManager']}>
            <TeacherDetailPage />
          </RoleGuard>
        )
      },
      {
        path: 'managers',
        element: (
          <RoleGuard allowedRoles={['principal']}>
            <ManagersPage />
          </RoleGuard>
        )
      },
      {
        path: 'attendance',
        element: (
          <RoleGuard allowedRoles={['principal', 'academicManager', 'adminManager', 'teacher']}>
            <AttendancePage />
          </RoleGuard>
        )
      },
      {
        path: 'timetable',
        element: <TimetablePage /> // Internal logic checks role
      },
      {
        path: 'exams',
        element: <ExamsPage />
      },
      {
        path: 'marks',
        element: (
          <RoleGuard allowedRoles={['principal', 'academicManager', 'adminManager', 'teacher']}>
            <MarksPage />
          </RoleGuard>
        )
      },
      {
        path: 'results',
        element: <ResultsPage />
      },
      {
        path: 'report-cards',
        element: <ReportCardsPage />
      },
      {
        path: 'assignments',
        element: <AssignmentsPage />
      },
      {
        path: 'fees',
        element: (
          <RoleGuard allowedRoles={['principal', 'financeManager']}>
            <FeesPage />
          </RoleGuard>
        )
      },
      {
        path: 'salaries',
        element: (
          <RoleGuard allowedRoles={['principal', 'financeManager']}>
            <SalariesPage />
          </RoleGuard>
        )
      },
      {
        path: 'leave',
        element: <LeavePage />
      },
      {
        path: 'library',
        element: <LibraryPage />
      },
      {
        path: 'transport',
        element: (
          <RoleGuard allowedRoles={['principal', 'adminManager', 'student']}>
            <TransportPage />
          </RoleGuard>
        )
      },
      {
        path: 'notifications',
        element: <NotificationsPage />
      },
      {
        path: 'announcements',
        element: <AnnouncementsPage />
      },
      {
        path: 'calendar',
        element: <CalendarPage />
      },
      {
        path: 'audit',
        element: (
          <RoleGuard allowedRoles={['principal', 'adminManager']}>
            <AuditPage />
          </RoleGuard>
        )
      },
      {
        path: 'settings',
        element: (
          <RoleGuard allowedRoles={['principal']}>
            <SettingsPage />
          </RoleGuard>
        )
      }
    ]
  },
  // { path: '/dashboard', element: <ProtectedRoute><AuthLayout><DashboardPage /></AuthLayout></ProtectedRoute> }, // COMP-23

  // Super admin routes — inside ProtectedRoute + RoleGuard
  // { path: '/superadmin/dashboard', element: <ProtectedRoute><SuperAdminLayout><SaDashboardPage /></SuperAdminLayout></ProtectedRoute> }, // COMP-03

  // Utility routes
  { path: '/forbidden', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
