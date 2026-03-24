# CHAT-2-HANDOFF.md
# FROM: Chat 2B Planner Agent
# TO:   Chat 3 Execution Agent
# SCOPE: EduCore ERP — Full Stack School Management System

---

## 1. PROJECT SUMMARY

Name:      EduCore ERP
Type:      Multi-school SaaS ERP — subscription-based
One-liner: Unifies academic, financial, and operational management
           across nine role-based panels for K-12 schools.

### Tech Stack
Frontend:
  React 18 + Vite (JSX only — NO TypeScript ever)
  Redux Toolkit, React Router v6, Axios, Zod + React Hook Form
  Socket.io-client, Framer Motion, react-hot-toast, Recharts
  ESLint (Airbnb config) + Prettier

Backend:
  Node.js + Express
  MongoDB + Mongoose (shared DB, schoolId tenant scoping)
  JWT (access 15min localStorage + refresh 7d httpOnly cookie)
  Socket.io, Cloudinary, Twilio, Nodemailer, pdfkit
  express-validator, multer, bcryptjs, uuid

### Roles (9)
  superAdmin — platform operator (manages all schools)
  principal  — school head (manages all within one school)
  financeManager, hrManager, academicManager, adminManager — managers
  teacher, student, parent — end users

### Multi-tenancy
  Shared MongoDB database. schoolId field on every school-scoped document.
  scopeToSchool middleware injects req.schoolId from JWT.
  Super admin is not school-scoped (schoolId: null in JWT).

---

## 2. FOLDER TREES

### Backend
```
backend/
├── .env
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── package.json
└── src/
    ├── app.js
    ├── server.js
    ├── seed.js
    ├── config/
    │   ├── db.js
    │   ├── env.js
    │   ├── cloudinary.js
    │   ├── nodemailer.js
    │   └── constants.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── scopeToSchool.js
    │   ├── roleMiddleware.js
    │   ├── validate.js
    │   ├── rateLimiter.js
    │   ├── uploadMiddleware.js
    │   ├── suspensionCheck.js
    │   └── globalErrorHandler.js
    ├── utils/
    │   ├── AppError.js
    │   ├── asyncHandler.js
    │   ├── tokenHelpers.js
    │   ├── paginationHelper.js
    │   └── auditWriter.js
    ├── socket/
    │   ├── socketInit.js
    │   └── socketHandlers.js
    ├── routes/
    │   └── v1.js
    ├── models/
    │   ├── User.js
    │   ├── OTP.js
    │   ├── School.js
    │   ├── Subscription.js
    │   ├── AcademicYear.js
    │   ├── Class.js
    │   ├── Section.js
    │   ├── Attendance.js
    │   ├── Timetable.js
    │   ├── Exam.js
    │   ├── Marks.js
    │   ├── Assignment.js
    │   ├── Fee.js
    │   ├── Salary.js
    │   ├── LeaveRequest.js
    │   ├── LibraryBook.js
    │   ├── Transport.js
    │   ├── Notification.js
    │   ├── Announcement.js
    │   ├── CalendarEvent.js
    │   └── AuditLog.js
    ├── services/
    │   ├── authService.js
    │   ├── otpService.js
    │   ├── smsService.js
    │   ├── emailService.js
    │   ├── fileService.js
    │   ├── notificationService.js
    │   ├── subscriptionService.js
    │   ├── attendanceService.js
    │   ├── marksService.js
    │   ├── feeService.js
    │   ├── salaryService.js
    │   └── pdfService.js
    └── features/
        ├── auth/
        │   ├── authRoutes.js
        │   ├── authController.js
        │   └── authValidators.js
        ├── schools/
        │   ├── schoolRoutes.js
        │   ├── schoolController.js
        │   └── schoolValidators.js
        ├── subscriptions/
        │   ├── subscriptionRoutes.js
        │   ├── subscriptionController.js
        │   └── subscriptionValidators.js
        ├── users/
        │   ├── userRoutes.js
        │   ├── userController.js
        │   └── userValidators.js
        ├── classes/
        │   ├── classRoutes.js
        │   ├── classController.js
        │   └── classValidators.js
        ├── students/
        │   ├── studentRoutes.js
        │   ├── studentController.js
        │   └── studentValidators.js
        ├── attendance/
        │   ├── attendanceRoutes.js
        │   ├── attendanceController.js
        │   └── attendanceValidators.js
        ├── timetable/
        │   ├── timetableRoutes.js
        │   ├── timetableController.js
        │   └── timetableValidators.js
        ├── exams/
        │   ├── examRoutes.js
        │   ├── examController.js
        │   └── examValidators.js
        ├── marks/
        │   ├── marksRoutes.js
        │   ├── marksController.js
        │   └── marksValidators.js
        ├── assignments/
        │   ├── assignmentRoutes.js
        │   ├── assignmentController.js
        │   └── assignmentValidators.js
        ├── fees/
        │   ├── feeRoutes.js
        │   ├── feeController.js
        │   └── feeValidators.js
        ├── salaries/
        │   ├── salaryRoutes.js
        │   ├── salaryController.js
        │   └── salaryValidators.js
        ├── leave/
        │   ├── leaveRoutes.js
        │   ├── leaveController.js
        │   └── leaveValidators.js
        ├── library/
        │   ├── libraryRoutes.js
        │   ├── libraryController.js
        │   └── libraryValidators.js
        ├── transport/
        │   ├── transportRoutes.js
        │   ├── transportController.js
        │   └── transportValidators.js
        ├── notifications/
        │   ├── notificationRoutes.js
        │   ├── notificationController.js
        │   └── notificationValidators.js
        ├── announcements/
        │   ├── announcementRoutes.js
        │   ├── announcementController.js
        │   └── announcementValidators.js
        ├── calendar/
        │   ├── calendarRoutes.js
        │   ├── calendarController.js
        │   └── calendarValidators.js
        ├── audit/
        │   ├── auditRoutes.js
        │   └── auditController.js
        └── settings/
            ├── settingsRoutes.js
            ├── settingsController.js
            └── settingsValidators.js
```

### Frontend
```
frontend/
├── .env
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles/
    │   └── global.css
    ├── constants/
    │   ├── roles.js
    │   ├── statusLabels.js
    │   └── appConfig.js
    ├── services/
    │   ├── axiosInstance.js
    │   └── endpoints.js
    ├── store/
    │   ├── store.js
    │   ├── rootReducer.js
    │   └── uiSlice.js
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useSocket.js
    │   └── useDebounce.js
    ├── router/
    │   ├── AppRouter.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── RoleGuard.jsx
    │   ├── ForbiddenPage.jsx
    │   └── NotFoundPage.jsx
    ├── layouts/
    │   ├── PublicLayout.jsx + .css
    │   ├── AuthLayout.jsx + .css
    │   ├── SuperAdminLayout.jsx + .css
    │   └── NotificationDropdown.jsx + .css
    ├── components/
    │   ├── PageHeader.jsx + .css
    │   ├── DataTable.jsx + .css
    │   ├── StatsCard.jsx + .css
    │   ├── StatusBadge.jsx + .css
    │   ├── Modal.jsx + .css
    │   ├── ConfirmDialog.jsx + .css
    │   ├── FileUploader.jsx + .css
    │   ├── Pagination.jsx + .css
    │   ├── EmptyState.jsx + .css
    │   └── Spinner.jsx + .css
    └── features/
        ├── auth/ (authSlice, authSchemas, LoginPage, ForgotPasswordPage, EmailLoginForm, OtpLoginForm)
        ├── landing/ (LandingPage)
        ├── superadmin/ (saSchoolSlice, subscriptionSlice, SaDashboardPage, SchoolsListPage, SchoolDetailPage, AddSchoolModal, SubscriptionsPage)
        ├── profile/ (profileSlice, profileSchemas, ProfilePage)
        ├── classes/ (classSlice, classSchemas, ClassesPage, ClassCard, SectionList, AddClassModal, AddSectionModal, AcademicYearPanel)
        ├── students/ (studentSlice, studentSchemas, StudentsListPage, StudentAdmissionPage, StudentDetailPage, AdmissionStep1-4, StudentFilters)
        ├── teachers/ (teacherSlice, TeachersPage, TeacherDetailPage, AddTeacherModal)
        ├── managers/ (managerSlice, ManagersPage, AddManagerModal)
        ├── attendance/ (attendanceSlice, AttendancePage, AttendanceMarkingGrid, AttendanceReportView, AttendanceFilters)
        ├── timetable/ (timetableSlice, TimetablePage, TimetableGrid, TimetableEditModal)
        ├── exams/ (examSlice, examSchemas, ExamsPage, ExamCard, DateSheetView, CreateExamModal)
        ├── marks/ (marksSlice, MarksPage, MarksEntryTable)
        ├── results/ (resultSlice, ResultsPage, ResultSummaryCard, PublishConfirmModal)
        ├── reportCards/ (reportCardSlice, ReportCardsPage)
        ├── assignments/ (assignmentSlice, assignmentSchemas, AssignmentsPage, AssignmentCard, CreateAssignmentModal)
        ├── fees/ (feeSlice, FeesPage, FeeStatusToggle, StudentFeeHistory)
        ├── salaries/ (salarySlice, SalariesPage, SalaryStatusToggle)
        ├── leave/ (leaveSlice, leaveSchemas, LeavePage, LeaveApplicationForm, LeaveHistoryTable, LeaveApprovalQueue)
        ├── library/ (librarySlice, LibraryPage, BookCatalog, AddBookModal, IssueBookModal)
        ├── transport/ (transportSlice, TransportPage, RouteCard, RouteDetailPanel, AddRouteModal)
        ├── notifications/ (notificationSlice, notificationSchemas, NotificationsPage, ComposeNotificationForm, NotificationInbox)
        ├── announcements/ (announcementSlice, AnnouncementsPage, AnnouncementCard, PostAnnouncementModal)
        ├── calendar/ (calendarSlice, CalendarPage, CalendarGrid, EventBadge, AddEventModal)
        ├── dashboard/ (dashboardSlice, DashboardPage, PrincipalDashboard, FinanceManagerDashboard, HrManagerDashboard, AcademicManagerDashboard, AdminManagerDashboard, TeacherDashboard, StudentDashboard, ParentDashboard)
        ├── audit/ (auditSlice, AuditPage, AuditLogTable)
        └── settings/ (settingsSlice, settingsSchemas, SettingsPage, SchoolProfileForm, AcademicYearForm)
```

---

## 3. KEY FILE PATHS (use verbatim in all instruction files)

| Purpose                  | Exact Path                                           |
|--------------------------|------------------------------------------------------|
| HTTP client              | frontend/src/services/axiosInstance.js               |
| Endpoint constants       | frontend/src/services/endpoints.js                   |
| Redux store              | frontend/src/store/store.js                          |
| Root reducer             | frontend/src/store/rootReducer.js                    |
| Router config            | frontend/src/router/AppRouter.jsx                    |
| ProtectedRoute           | frontend/src/router/ProtectedRoute.jsx               |
| RoleGuard                | frontend/src/router/RoleGuard.jsx                    |
| Root route aggregator    | backend/src/routes/v1.js                             |
| App setup                | backend/src/app.js                                   |
| Server entry             | backend/src/server.js                                |
| Global CSS               | frontend/src/styles/global.css                       |
| Roles constants          | frontend/src/constants/roles.js                      |
| Status labels            | frontend/src/constants/statusLabels.js               |
| App config               | frontend/src/constants/appConfig.js                  |
| Socket init              | backend/src/socket/socketInit.js                     |
| AppError                 | backend/src/utils/AppError.js                        |
| asyncHandler             | backend/src/utils/asyncHandler.js                    |
| paginationHelper         | backend/src/utils/paginationHelper.js                |
| auditWriter (UTIL-02)    | backend/src/utils/auditWriter.js                     |
| tokenHelpers             | backend/src/utils/tokenHelpers.js                    |
| authMiddleware           | backend/src/middleware/authMiddleware.js              |
| scopeToSchool            | backend/src/middleware/scopeToSchool.js              |
| roleMiddleware           | backend/src/middleware/roleMiddleware.js              |
| validate middleware      | backend/src/middleware/validate.js                   |
| rateLimiter              | backend/src/middleware/rateLimiter.js                |
| uploadMiddleware         | backend/src/middleware/uploadMiddleware.js            |
| suspensionCheck          | backend/src/middleware/suspensionCheck.js            |
| globalErrorHandler       | backend/src/middleware/globalErrorHandler.js          |
| DB config                | backend/src/config/db.js                             |
| Env validation           | backend/src/config/env.js                            |
| Cloudinary config        | backend/src/config/cloudinary.js                     |
| Nodemailer config        | backend/src/config/nodemailer.js                     |
| BE constants             | backend/src/config/constants.js                      |

---

## 4. BUILD ORDER

  #   | ID        | Name                                | Type
  ----|-----------|-------------------------------------|----------
  0a  | UTIL-01   | useDebounce                         | FE ONLY
  0b  | UTIL-02   | auditWriter                         | BE ONLY
  1   | INFRA-01  | Project Setup & Backend Foundation  | FE + BE
  2   | INFRA-02  | App Shell                           | FE ONLY
  3   | INFRA-03  | Shared UI Components                | FE ONLY
  4   | COMP-01   | Authentication                      | FULL STACK
  5   | INFRA-04  | Database Seed Script                | BE ONLY
  6   | COMP-02   | Landing Page                        | FE ONLY
  7   | COMP-03   | SuperAdmin: Schools & Dashboard     | FULL STACK
  8   | COMP-04   | SuperAdmin: Subscriptions           | FULL STACK
  9   | COMP-05   | Profile                             | FULL STACK
  10  | COMP-06   | Classes, Sections & Academic Years  | FULL STACK
  11  | COMP-07   | Students                            | FULL STACK
  12  | COMP-08   | Teachers & Managers                 | FULL STACK
  13  | COMP-09   | Attendance                          | FULL STACK
  14  | COMP-10   | Timetable                           | FULL STACK
  15  | COMP-11   | Exams                               | FULL STACK
  16  | COMP-12   | Marks & Results                     | FULL STACK
  17  | COMP-13   | Report Cards                        | FULL STACK
  18  | COMP-14   | Assignments                         | FULL STACK
  19  | COMP-15   | Fees                                | FULL STACK
  20  | COMP-16   | Salaries                            | FULL STACK
  21  | COMP-17   | Leave Management                    | FULL STACK
  22  | COMP-18   | Library                             | FULL STACK
  23  | COMP-19   | Transport                           | FULL STACK
  24  | COMP-20   | Notifications                       | FULL STACK
  25  | COMP-21   | Announcements                       | FULL STACK
  26  | COMP-22   | Calendar                            | FULL STACK
  27  | COMP-23   | Dashboard                           | FE ONLY
  28  | COMP-24   | Audit Log                           | FULL STACK
  29  | COMP-25   | Settings                            | FULL STACK

  Total: 2 UTILs + 4 INFRAs + 25 COMPs = 31 buildable units

---

## 5. REVIEW RULES FOR CHAT 3 EXECUTION AGENT

### After every backend.md task:
  - [ ] All endpoints match the component spec (method, path, auth)
  - [ ] Every endpoint uses asyncHandler wrapper
  - [ ] Every endpoint applies the correct rateLimiter tier
  - [ ] Validators file exists and covers all inputs
  - [ ] validate() middleware applied before controller in every route
  - [ ] scopeToSchool applied on all school-scoped routes
  - [ ] suspensionCheck applied on school-scoped POST/PATCH/DELETE
  - [ ] roleMiddleware applied where required
  - [ ] Services throw AppError — never throw raw errors
  - [ ] Controllers only orchestrate — business logic is in services
  - [ ] auditWriter called where component spec says "auditWriter: on X"
  - [ ] Router added via router.use() in backend/src/routes/v1.js
  - [ ] New models import mongoose and export the model correctly
  - [ ] Console.log present at controller entry and key service steps
  - [ ] No hardcoded secrets or URLs

### After every frontend.md task:
  - [ ] All pages match component spec routes and role guards
  - [ ] Async operations only via createAsyncThunk (no direct axios calls)
  - [ ] Slice added to rootReducer.js combineReducers
  - [ ] Routes added to AppRouter.jsx inside correct layout block
  - [ ] All forms use Zod + React Hook Form (no uncontrolled forms)
  - [ ] API calls in thunks only use named constants from endpoints.js
  - [ ] No hardcoded color values in component CSS (use CSS variables)
  - [ ] Inter font used — no system fonts
  - [ ] Design notes from component spec reflected in the UI
  - [ ] Shared components (DataTable, Modal, StatsCard) used where applicable
  - [ ] No TypeScript syntax anywhere (JSX only)
  - [ ] No @/ import aliases (relative paths only)
  - [ ] No barrel files

### After every integration-review:
  - [ ] Backend endpoints return data matching shape used by frontend thunks
  - [ ] Pagination: { items, total, page, limit, totalPages } if paginated
  - [ ] Success/error envelope: { success, message, data } on all responses
  - [ ] Auth flow: accessToken stored correctly, refresh cookie set
  - [ ] Role access tested for all roles that should/should not reach endpoint
  - [ ] api-contracts.md updated with this component's endpoints

---

## 6. MASTER COMPONENT LIST — SECTION A (Units 1–15 of 31)

### UTIL-01 — useDebounce
  TYPE:      FE ONLY (hook)
  File:      frontend/src/hooks/useDebounce.js
  Purpose:   Delays a value update by N ms (default 300ms). Prevents API dispatch on every keypress.
  Depends on: INFRA-02
  Needed by:  COMP-07, COMP-08, COMP-18

### UTIL-02 — auditWriter
  TYPE:      BE ONLY (utility function)
  File:      backend/src/utils/auditWriter.js
  Purpose:   Writes one AuditLog document. Args: { actorId, actorRole, schoolId, action, targetModel, targetId, metadata }.
  Depends on: INFRA-01
  Needed by:  COMP-03, COMP-06, COMP-07, COMP-08, COMP-14, COMP-15, COMP-17, COMP-19, COMP-24

### INFRA-01 — Project Setup & Backend Foundation
  TYPE:      FE + BE
  Purpose:   Full project scaffolding. All middleware. All 21 models. All config. All utils. CSS variables. ESLint.
  Depends on: nothing — FIRST TASK
  Needed by:  everything

### INFRA-02 — App Shell
  TYPE:      FE ONLY
  Purpose:   axiosInstance + interceptors. Redux store. All layouts. All routing. All hooks. Global constants.
  Depends on: INFRA-01
  Needed by:  all FE components

### INFRA-03 — Shared UI Components
  TYPE:      FE ONLY
  Files:     frontend/src/components/ — PageHeader, DataTable, StatsCard, StatusBadge, Modal, ConfirmDialog, FileUploader, Pagination, EmptyState, Spinner
  Purpose:   Reusable data-driven components using CSS variables. Inherit panel colors automatically.
  Depends on: INFRA-01, INFRA-02
  Needed by:  COMP-01 through COMP-25

### INFRA-04 — Database Seed Script
  TYPE:      BE ONLY
  File:      backend/src/seed.js
  Purpose:   Seeds superAdmin + test school + principal + 4 managers + 1 AcademicYear + 2 classes + 5 teachers/students/parents. Idempotent.
  Depends on: COMP-01-INTEGRATION
  Needed by:  nothing — run-once utility

### COMP-01 — Authentication
  TYPE:      FULL STACK
  Endpoints: POST /auth/login/email | /auth/send-otp | /auth/login/otp | /auth/refresh | /auth/logout | /auth/forgot-password | /auth/reset-password
  Models:    User, OTP
  State:     authSlice → { user, isAuthenticated, loading, error }
  Routes:    /login | /forgot-password (PublicLayout)
  Design:    Split-screen. Left: navy→teal gradient + academic SVG. Right: white form, teal CTA, 10px radius inputs, two-tab toggle.
  Depends on: INFRA-01, INFRA-02, INFRA-03
  Needed by:  everything

### COMP-02 — Landing Page
  TYPE:      FE ONLY
  State:     none
  Route:     / (PublicLayout — authenticated → redirect /dashboard)
  Design:    Sky-blue SaaS marketing. Navbar + Hero + Feature grid + How-it-works + Stats + CTA banner + Footer.
  Depends on: INFRA-02
  Needed by:  nothing

### COMP-03 — SuperAdmin: Schools & Platform Dashboard
  TYPE:      FULL STACK
  Endpoints: POST/GET /schools | GET/PUT /schools/:id | PATCH /schools/:id/suspend | PATCH /schools/:id/reactivate
  Models:    School, User (principal)
  State:     saSchoolSlice → standard + stats:{total,active,suspended,expiringSoon}
  Routes:    /superadmin/dashboard | /superadmin/schools | /superadmin/schools/:id (SuperAdminLayout)
  Design:    SA panel (green #00C37F, two-level sidebar, #F4F5F7 bg). SchoolsListPage: CARD GRID (not table).
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01
  Needed by:  COMP-04

### COMP-04 — SuperAdmin: Subscriptions
  TYPE:      FULL STACK
  Endpoints: GET /subscriptions | GET/PATCH /subscriptions/:id/plan | POST /subscriptions/:id/billing
  Models:    Subscription
  State:     subscriptionSlice → standard shape
  Routes:    /superadmin/subscriptions (SuperAdminLayout)
  Design:    SA panel. DataTable with tab filter + status dot badges. Plan tier chips.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-03
  Needed by:  nothing

### COMP-05 — Profile
  TYPE:      FULL STACK
  Endpoints: GET/PUT /users/profile | PUT /users/password
  Models:    User
  State:     profileSlice → { profile, loading, error, updateLoading }
  Routes:    /profile (AuthLayout) | /superadmin/profile (SuperAdminLayout)
  Design:    Single-column form card (max 640px). Large avatar with hover upload. Amber mustChangePassword banner.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01
  Needed by:  all roles

### COMP-06 — Classes, Sections & Academic Years
  TYPE:      FULL STACK
  Endpoints: POST/GET /classes | PUT/DELETE /classes/:id | POST/PUT/DELETE /classes/:id/sections/:secId | POST/GET /academic-years | PATCH /academic-years/:id/current
  Models:    Class, Section, AcademicYear
  State:     classSlice → { classes, academicYears, currentYear, loading, error }
  Routes:    /classes (AuthLayout)
  Design:    2-col ClassCard grid. AcademicYearPanel banner at top with year tabs.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01
  Needed by:  COMP-07–14, COMP-20, COMP-25

### COMP-07 — Students
  TYPE:      FULL STACK
  Endpoints: POST/GET /students | GET/PUT /students/:id | PATCH /students/:id/deactivate
  Models:    User (student + parent)
  State:     studentSlice → standard shape
  Routes:    /students | /students/new | /students/:id (AuthLayout)
  Design:    DataTable with avatar col. 4-step stepper admission. Blue gradient profile banner + tabbed detail.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-06, UTIL-01
  Needed by:  COMP-09, COMP-12, COMP-14, COMP-15, COMP-16, COMP-19, COMP-23

### COMP-08 — Teachers & Managers
  TYPE:      FULL STACK
  Endpoints: POST/GET /users/teachers | GET /users/teachers/:id | POST/GET /users/managers | PATCH /users/:id/status
  Models:    User (teacher + manager roles)
  State:     teacherSlice + managerSlice → standard shape each
  Routes:    /teachers | /teachers/:id | /managers (AuthLayout)
  Design:    DataTable pattern. Manager role chips colored per type. TeacherDetailPage: profile banner + tabbed.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-06, UTIL-01
  Needed by:  COMP-09, COMP-10, COMP-15, COMP-16, COMP-23

### COMP-09 — Attendance
  TYPE:      FULL STACK
  Endpoints: POST /attendance | GET /attendance/section/:id | GET /attendance/student/:id | GET /attendance/report
  Models:    Attendance
  State:     attendanceSlice → { records, report, loading, error }
  Routes:    /attendance (AuthLayout — role-aware)
  Design:    Marking: full-width roster, P/A/L pill toggles, sticky Save footer. Report: DataTable with % col.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-06, COMP-07
  Needed by:  COMP-07 (student detail), COMP-23

---

## 6. MASTER COMPONENT LIST — SECTION B (Units 16–31 of 31)

### COMP-10 — Timetable
  TYPE:      FULL STACK
  Endpoints: PUT/GET /timetable/:sectionId | GET /timetable/me
  Models:    Timetable
  State:     timetableSlice → { schedule, loading, error }
  Routes:    /timetable (AuthLayout)
  Design:    CSS grid Mon-Sat × periods. Blue day headers. Editable hover pencil. TimetableEditModal.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-06, COMP-08
  Needed by:  COMP-23

### COMP-11 — Exams
  TYPE:      FULL STACK
  Endpoints: POST/GET /exams | GET/PUT/DELETE /exams/:id
  Models:    Exam
  State:     examSlice → standard shape
  Routes:    /exams (AuthLayout)
  Design:    Wide card list. ExamCard expands to DateSheetView. CreateExamModal with dynamic rows.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-06
  Needed by:  COMP-12, COMP-13, COMP-23

### COMP-12 — Marks & Results
  TYPE:      FULL STACK
  Endpoints: POST /marks | GET /marks/exam/:eId/section/:sId | PATCH .../publish | GET /marks/student/:sId/exam/:eId
  Models:    Marks
  State:     marksSlice + resultSlice → standard shape each
  Routes:    /marks | /results (AuthLayout)
  Design:    Full-width scrollable grid, 32px compact cells, grade badge col. ResultSummaryCard, PublishConfirmModal.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-06, COMP-07, COMP-11
  Needed by:  COMP-13, COMP-23

### COMP-13 — Report Cards
  TYPE:      FULL STACK
  Endpoints: GET /report-cards/:studentId/exam/:examId → PDF stream
  Models:    reads Marks, User, Exam, School
  State:     reportCardSlice → { loading, error }
  Routes:    /report-cards (AuthLayout)
  Design:    Simple card. Download buttons per exam row. Spinner during PDF generation.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-07, COMP-11, COMP-12
  Needed by:  nothing

### COMP-14 — Assignments
  TYPE:      FULL STACK
  Endpoints: POST /assignments | GET /assignments/section/:id | GET/DELETE /assignments/:id
  Models:    Assignment
  State:     assignmentSlice → standard shape
  Routes:    /assignments (AuthLayout)
  Design:    Card list. AssignmentCard: due date chip (amber→red if overdue). CreateAssignmentModal with FileUploader.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-06, COMP-07
  Needed by:  COMP-23

### COMP-15 — Fees
  TYPE:      FULL STACK
  Endpoints: POST/GET /fees | GET /fees/student/:id | PATCH /fees/:id/paid | PATCH /fees/:id/unpaid
  Models:    Fee
  State:     feeSlice → standard + stats:{collected,outstanding}
  Routes:    /fees (AuthLayout)
  Design:    Finance ref: charts top → tab filter → dense DataTable. Dot badges (●green=paid, ●red=unpaid, ●amber=overdue).
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-06, COMP-07
  Needed by:  COMP-07 (student detail), COMP-23

### COMP-16 — Salaries
  TYPE:      FULL STACK
  Endpoints: POST/GET /salaries | GET /salaries/teacher/:id | PATCH /salaries/:id/paid | PATCH /salaries/:id/unpaid
  Models:    Salary
  State:     salarySlice → standard shape
  Routes:    /salaries (AuthLayout — Finance Manager only)
  Design:    Same finance panel pattern as fees. Month prev/next navigation arrows.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-08
  Needed by:  COMP-08 (teacher detail), COMP-23

### COMP-17 — Leave Management
  TYPE:      FULL STACK
  Endpoints: POST /leave | GET /leave/my | GET /leave/queue | PATCH /leave/:id/review
  Models:    LeaveRequest
  State:     leaveSlice → { myRequests, queue, loading, error }
  Routes:    /leave (AuthLayout — same URL, role-aware tabs)
  Design:    Tab switcher: Apply | My History | Approval Queue. Queue: inline Approve/Reject per row.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01
  Needed by:  COMP-08 (teacher detail), COMP-23

### COMP-18 — Library
  TYPE:      FULL STACK
  Endpoints: POST/GET /library | GET/PUT/DELETE /library/:id | POST /library/:id/issue | POST /library/:id/return
  Models:    LibraryBook
  State:     librarySlice → standard shape
  Routes:    /library (AuthLayout)
  Design:    DataTable catalog with useDebounce search. Availability badge green/red. Issue/Return row actions.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, UTIL-01
  Needed by:  COMP-23

### COMP-19 — Transport
  TYPE:      FULL STACK
  Endpoints: POST/GET /transport | GET/PUT/DELETE /transport/:id | POST /transport/:id/assign | POST /transport/:id/unassign
  Models:    Transport
  State:     transportSlice → standard shape
  Routes:    /transport (AuthLayout)
  Design:    Admin: 2-col route card grid. RouteCard expands to RouteDetailPanel. Student: single "Your Route" card.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-07
  Needed by:  COMP-23

### COMP-20 — Notifications
  TYPE:      FULL STACK
  Endpoints: POST/GET /notifications | PATCH /notifications/read | GET /notifications/unread-count
  Socket:    Emits notification:new to user:<id> or class:<id> rooms
  Models:    Notification
  State:     notificationSlice → { notifications, unreadCount, loading, error }
  Routes:    /notifications (AuthLayout)
  Design:    Teacher: ComposeNotificationForm (3-button scope toggle) + sent history. Student: NotificationInbox.
             Unread rows: #EAF5FF bg + 2px blue left border.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-06, COMP-07
  Needed by:  COMP-23 (unread badge)

### COMP-21 — Announcements
  TYPE:      FULL STACK
  Endpoints: POST/GET /announcements | GET/DELETE /announcements/:id
  Models:    Announcement
  State:     announcementSlice → standard shape
  Routes:    /announcements (AuthLayout)
  Design:    Full-width card list. AnnouncementCard: blue left border, truncated body + Framer Motion expand.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01
  Needed by:  COMP-23

### COMP-22 — Calendar
  TYPE:      FULL STACK
  Endpoints: POST/GET /calendar | PUT/DELETE /calendar/:id
  Models:    CalendarEvent
  State:     calendarSlice → { events, loading, error }
  Routes:    /calendar (AuthLayout)
  Design:    White CSS grid calendar. EventBadge pills per day cell. holiday=red, exam=blue, event=green.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01
  Needed by:  COMP-23

### COMP-23 — Dashboard
  TYPE:      FE ONLY — NO new backend endpoints
  State:     dashboardSlice → { stats, loading, error } (reads other slices)
  Routes:    /dashboard (AuthLayout — role-aware, 8 sub-dashboard components)
  Design:    Kidzee ref — 4 StatsCards + 2 chart cards + 2 list/widget cards. Each role shows role-relevant data.
  Depends on: INFRA-02, COMP-01, and all component backends — MUST BE LAST (position 27)
  Needed by:  nothing — terminal component

### COMP-24 — Audit Log
  TYPE:      FULL STACK
  Endpoints: GET /audit (paginated, filter by actor/action/targetModel/date)
  Models:    AuditLog (written by UTIL-02, read here only)
  State:     auditSlice → standard shape
  Routes:    /audit (AuthLayout — Principal + Admin Manager only)
  Design:    DataTable full card. Filter bar above. Dense rows. Relative timestamp + full on hover.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, UTIL-02
  Needed by:  nothing

### COMP-25 — Settings
  TYPE:      FULL STACK
  Endpoints: GET/PUT /settings
  Models:    School (update), AcademicYear (read)
  State:     settingsSlice → { school, loading, error }
  Routes:    /settings (AuthLayout — Principal manages)
  Design:    Two stacked white section cards (max 700px). Card 1: school profile form + logo upload.
             Card 2: current year display + "Manage Academic Years" link → /classes.
  Depends on: INFRA-01, INFRA-02, INFRA-03, COMP-01, COMP-06
  Needed by:  nothing

---

## 7. SHARED FILES

### shared/conventions.md
(Full content — save verbatim to shared/conventions.md)

# shared/conventions.md
# TYPE: EXECUTION FILE — FOR CODING AGENT
# Read this before every task. Every rule here is non-negotiable.

## Project Overview
Name: EduCore ERP | Stack: React+Vite(JSX), Redux Toolkit, Axios, Socket.io-client, Recharts
      Node+Express, MongoDB+Mongoose, JWT, Socket.io, Cloudinary, Twilio, Nodemailer, pdfkit
Multi-tenancy: Shared MongoDB. schoolId on every school doc. scopeToSchool injects req.schoolId.

## API Response Format
Success: { "success":true, "message":"...", "data":{...} }
Error:   { "success":false, "message":"...", "errors":[...] }
Paginated data: { "items":[...], "total":N, "page":N, "limit":N, "totalPages":N }
HTTP codes: 200 ok | 201 created | 400 bad req | 401 unauth | 403 forbidden | 404 not found | 409 conflict | 422 validation | 500 server

## Axios Instance Rules
Single instance at frontend/src/services/axiosInstance.js — NEVER create another.
Request interceptor: read accessToken from localStorage (appConfig.ACCESS_TOKEN_KEY) → Authorization: Bearer.
Response interceptor (401 ONLY): POST /auth/refresh → store new token + retry OR dispatch clearAuth() → redirect /login.

## CORS: app.js ONCE — origin: process.env.CLIENT_URL, credentials: true. Never in route files.

## Rate Limiting
STRICT 5/min — /auth/* | MODERATE 30/min — POST/PUT/PATCH/DELETE | LIGHT 100/min — GET
Route order: rateLimiter → validate(schema) → controller. Never skip.

## Token Rules
Access: localStorage appConfig.ACCESS_TOKEN_KEY, 15min. Refresh: httpOnly cookie, 7d, NEVER readable by JS.
JWT: { userId, role, schoolId } — schoolId null for superAdmin.
mustChangePassword: amber banner on ProfilePage, NOT a redirect block.

## Backend Validation Pattern
express-validator in feature validators file. validate() middleware → 422 + errors array if invalid.
Controllers NEVER manually check fields. ALL inputs trimmed in validators.

## Frontend Form Pattern
Zod + React Hook Form + @hookform/resolvers/zod. Schema in featureSchemas.js.
Field-level errors (var(--danger)). NEVER call API without Zod validation.

## State Management Pattern
ALL async ops via createAsyncThunk. NEVER call axiosInstance from components.
Standard slice: { items:[], selectedItem:null, loading:false, error:null, pagination:{page:1,limit:20,total:0,totalPages:0} }
toast.success() in fulfilled. toast.error() for network errors. Local useState: modal/tab/sort only.

## Import Rules
Relative paths only. No @/ alias. No barrel index.js files.
Order: React → third-party → Redux → local feature → shared components → CSS.

## Naming Conventions
PascalCase.jsx components | PascalCase.css co-located | camelCase.js hooks/utils
camelCase+Slice.js Redux | camelCase+Schemas.js Zod | PascalCase.js BE models
SCREAMING_SNAKE_CASE constants | kebab-case CSS classes | BEM: .block__element--modifier

## Security Rules
No hardcoded secrets. Trim all inputs. MIME whitelist uploads. UUID server filenames.
bcrypt BCRYPT_ROUNDS=12. OTPs bcrypt-hashed, deleted on first use.
ALL school-scoped queries use req.schoolId — NEVER req.body schoolId for scoping.

## Env Management
BE env vars: PORT MONGO_URI JWT_ACCESS_SECRET JWT_REFRESH_SECRET CLIENT_URL
  CLOUDINARY_* TWILIO_* NODEMAILER_*
FE env vars: VITE_API_URL
config/env.js validates all BE vars. process.exit(1) if any missing. Only config/ reads process.env.

## Logging Convention
console.log('[Controller] method — userId: X') | console.log('[Service] op starting')
console.log('[Cloudinary] upload success') | console.log('[Socket] emitted — room: X')
console.error('[GlobalErrorHandler] ', err.stack) — ONLY here. Never log passwords/tokens/PII.

## Error Handling
BE: asyncHandler wraps controllers (no try/catch). Services throw AppError. globalErrorHandler formats all.
FE: 401 → interceptor only. Others → rejectWithValue → inline. Network → toast.error. Success → toast.success.

## Protected Files (add to, never restructure)
backend/src/routes/v1.js — each COMP-BE adds one router.use() line
frontend/src/store/rootReducer.js — each COMP-FE adds one slice key
frontend/src/router/AppRouter.jsx — each COMP-FE adds route entries

## Design Language Rule
No hardcoded colors in component CSS. CSS variables only.
.school-panel: --school-primary:#0B9ADB, --school-bg:#EAF5FF
.sa-panel: --sa-primary:#00C37F, --sa-bg:#F4F5F7
Shared: --font-family:'Inter',sans-serif | --border-radius-md:8px
  --text-primary:#1A1D23 | --danger:#EF4444 | --warning:#F59E0B | --success:#22C55E
Inter from Google Fonts in index.html. No system fonts ever.

---

### shared/api-contracts.md
(Full content — save verbatim to shared/api-contracts.md)

# shared/api-contracts.md
# TYPE: EXECUTION FILE — FOR CODING AGENT
# Updated by Chat 3 after every backend component. NEVER call unlisted endpoints.

## Format: Input = body/params. Output = data field shape. All routes: /api/v1/

GET /api/v1/health → { status:"ok", uptime:number, timestamp:string }  (no auth)

## COMP-01 through COMP-25 endpoints
(Chat 3 fills each section after completing the respective backend task)

---

### shared/socket-events.md
(Full content — save verbatim to shared/socket-events.md)

# shared/socket-events.md
# TYPE: EXECUTION FILE — FOR CODING AGENT

## Connection
Server: io = new Server(httpServer, { cors:{origin:CLIENT_URL,credentials:true} })
  io.use(socketAuthMiddleware) → io.on('connection', socket => socket.join(`user:${socket.userId}`))
Client: io(SOCKET_URL, { auth:{token:localStorage.getItem(ACCESS_TOKEN_KEY)}, reconnectionAttempts:5 })
  Mounted ONCE in AuthLayout.jsx. Torn down on logout. NOT in Redux.

## Namespace: / (default, single, v1)

## Rooms
user:<userId> — everyone joins on connect (personal notifications)
class:<classId> — teachers + students join their class room

## CLIENT → SERVER: none in v1

## SERVER → CLIENT

notification:new
  Emitted by: notificationService.js after POST /notifications DB write
  Room: user:<recipientId> OR class:<classId>
  Payload: { notificationId, message, senderId, senderName, type:'individual'|'section'|'class', createdAt }
  Frontend: dispatch(addNotification(payload)) + dispatch(incrementUnreadCount()) + toast.success(...)

## Socket Auth Middleware
socket.handshake.auth.token → tokenHelpers.verifyToken → attach socket.userId/role/schoolId

## Disconnect Handling
connect_error → console.log, no redirect
disconnect 'io server disconnect' → dispatch(clearAuth()) → window.location='/login'
all other reasons → socket auto-reconnects (up to 5 attempts)

---

## 8. ENDPOINT CONSTANTS (frontend/src/services/endpoints.js)

export const ENDPOINTS = {
  HEALTH:                    '/health',
  // Auth
  AUTH_LOGIN_EMAIL:          '/auth/login/email',
  AUTH_SEND_OTP:             '/auth/send-otp',
  AUTH_LOGIN_OTP:            '/auth/login/otp',
  AUTH_REFRESH:              '/auth/refresh',
  AUTH_LOGOUT:               '/auth/logout',
  AUTH_FORGOT_PASSWORD:      '/auth/forgot-password',
  AUTH_RESET_PASSWORD:       '/auth/reset-password',
  // SA Schools
  SCHOOLS:                   '/schools',
  SCHOOL_BY_ID:         (id) => `/schools/${id}`,
  SCHOOL_SUSPEND:       (id) => `/schools/${id}/suspend`,
  SCHOOL_REACTIVATE:    (id) => `/schools/${id}/reactivate`,
  // SA Subscriptions
  SUBSCRIPTIONS:             '/subscriptions',
  SUBSCRIPTION_BY_ID:   (id) => `/subscriptions/${id}`,
  SUBSCRIPTION_PLAN:    (id) => `/subscriptions/${id}/plan`,
  SUBSCRIPTION_BILLING: (id) => `/subscriptions/${id}/billing`,
  // Profile
  PROFILE:                   '/users/profile',
  PROFILE_PASSWORD:          '/users/password',
  // Teachers & Managers
  TEACHERS:                  '/users/teachers',
  TEACHER_BY_ID:        (id) => `/users/teachers/${id}`,
  MANAGERS:                  '/users/managers',
  USER_STATUS:          (id) => `/users/${id}/status`,
  // Classes & Academic Years
  CLASSES:                   '/classes',
  CLASS_BY_ID:          (id) => `/classes/${id}`,
  SECTIONS:         (classId) => `/classes/${classId}/sections`,
  SECTION_BY_ID: (cId, sId)  => `/classes/${cId}/sections/${sId}`,
  ACADEMIC_YEARS:            '/academic-years',
  ACADEMIC_YEAR_CURRENT: (id) => `/academic-years/${id}/current`,
  // Students
  STUDENTS:                  '/students',
  STUDENT_BY_ID:        (id) => `/students/${id}`,
  STUDENT_DEACTIVATE:   (id) => `/students/${id}/deactivate`,
  // Attendance
  ATTENDANCE:                '/attendance',
  ATTENDANCE_SECTION:   (id) => `/attendance/section/${id}`,
  ATTENDANCE_STUDENT:   (id) => `/attendance/student/${id}`,
  ATTENDANCE_REPORT:         '/attendance/report',
  // Timetable
  TIMETABLE_SECTION:    (id) => `/timetable/${id}`,
  TIMETABLE_ME:              '/timetable/me',
  // Exams
  EXAMS:                     '/exams',
  EXAM_BY_ID:           (id) => `/exams/${id}`,
  // Marks
  MARKS:                     '/marks',
  MARKS_EXAM_SECTION: (eId, sId) => `/marks/exam/${eId}/section/${sId}`,
  MARKS_PUBLISH:      (eId, sId) => `/marks/exam/${eId}/section/${sId}/publish`,
  MARKS_STUDENT_EXAM: (sId, eId) => `/marks/student/${sId}/exam/${eId}`,
  // Report Cards
  REPORT_CARD:       (sId, eId) => `/report-cards/${sId}/exam/${eId}`,
  // Assignments
  ASSIGNMENTS:               '/assignments',
  ASSIGNMENTS_SECTION:  (id) => `/assignments/section/${id}`,
  ASSIGNMENT_BY_ID:     (id) => `/assignments/${id}`,
  // Fees
  FEES:                      '/fees',
  FEES_STUDENT:         (id) => `/fees/student/${id}`,
  FEE_PAID:             (id) => `/fees/${id}/paid`,
  FEE_UNPAID:           (id) => `/fees/${id}/unpaid`,
  // Salaries
  SALARIES:                  '/salaries',
  SALARIES_TEACHER:     (id) => `/salaries/teacher/${id}`,
  SALARY_PAID:          (id) => `/salaries/${id}/paid`,
  SALARY_UNPAID:        (id) => `/salaries/${id}/unpaid`,
  // Leave
  LEAVE:                     '/leave',
  LEAVE_MY:                  '/leave/my',
  LEAVE_QUEUE:               '/leave/queue',
  LEAVE_REVIEW:         (id) => `/leave/${id}/review`,
  // Library
  LIBRARY:                   '/library',
  LIBRARY_BY_ID:        (id) => `/library/${id}`,
  LIBRARY_ISSUE:        (id) => `/library/${id}/issue`,
  LIBRARY_RETURN:       (id) => `/library/${id}/return`,
  // Transport
  TRANSPORT:                 '/transport',
  TRANSPORT_BY_ID:      (id) => `/transport/${id}`,
  TRANSPORT_ASSIGN:     (id) => `/transport/${id}/assign`,
  TRANSPORT_UNASSIGN:   (id) => `/transport/${id}/unassign`,
  // Notifications
  NOTIFICATIONS:             '/notifications',
  NOTIFICATIONS_READ:        '/notifications/read',
  NOTIFICATIONS_UNREAD:      '/notifications/unread-count',
  // Announcements
  ANNOUNCEMENTS:             '/announcements',
  ANNOUNCEMENT_BY_ID:   (id) => `/announcements/${id}`,
  // Calendar
  CALENDAR:                  '/calendar',
  CALENDAR_BY_ID:       (id) => `/calendar/${id}`,
  // Audit
  AUDIT:                     '/audit',
  // Settings
  SETTINGS:                  '/settings',
}

---

## 9. STATE SLICES REGISTRY (frontend/src/store/rootReducer.js)

Standard shape: { items:[], selectedItem:null, loading:false, error:null, pagination:{page:1,limit:20,total:0,totalPages:0} }

  auth:          features/auth/authSlice.js              → { user, isAuthenticated, loading, error }
  ui:            store/uiSlice.js                        → { sidebarCollapsed, globalLoading }
  notification:  features/notifications/notificationSlice.js → { notifications:[], unreadCount:0, loading, error }
  saSchool:      features/superadmin/saSchoolSlice.js    → standard + stats:{total,active,suspended,expiringSoon}
  subscription:  features/superadmin/subscriptionSlice.js → standard
  profile:       features/profile/profileSlice.js        → { profile:null, loading, error, updateLoading:false }
  class:         features/classes/classSlice.js          → { classes:[], academicYears:[], currentYear:null, loading, error }
  student:       features/students/studentSlice.js       → standard
  teacher:       features/teachers/teacherSlice.js       → standard
  manager:       features/managers/managerSlice.js       → standard
  attendance:    features/attendance/attendanceSlice.js  → { records:[], report:[], loading, error }
  timetable:     features/timetable/timetableSlice.js    → { schedule:null, loading, error }
  exam:          features/exams/examSlice.js             → standard
  marks:         features/marks/marksSlice.js            → { entries:[], loading, error }
  result:        features/results/resultSlice.js         → { results:[], studentResult:null, loading, error }
  reportCard:    features/reportCards/reportCardSlice.js → { loading, error }
  assignment:    features/assignments/assignmentSlice.js → standard
  fee:           features/fees/feeSlice.js               → standard + stats:{collected,outstanding}
  salary:        features/salaries/salarySlice.js        → standard + teacherSalaries:[]
  leave:         features/leave/leaveSlice.js            → { myRequests:[], queue:[], loading, error }
  library:       features/library/librarySlice.js        → standard
  transport:     features/transport/transportSlice.js    → standard
  announcement:  features/announcements/announcementSlice.js → standard
  calendar:      features/calendar/calendarSlice.js      → { events:[], loading, error }
  dashboard:     features/dashboard/dashboardSlice.js    → { stats:{}, loading, error }
  audit:         features/audit/auditSlice.js            → standard
  settings:      features/settings/settingsSlice.js      → { school:null, loading, error }

Total: 27 slices

---

## 10. DESIGN LANGUAGE REFERENCE

### Public Panel (Landing, Login, ForgotPassword)
  LandingPage: sky blue (#3B9EE6) + white + teal (#14B8A6). SaaS marketing layout.
    Navbar → Hero + dual CTA → Feature icon-card grid → How-it-works → Stats → Teal CTA banner → Footer.
  LoginPage: split-screen. Left half: navy #1E3A8A → teal #14B8A6 gradient + academic SVG illustration.
    Right half: white, centered form card. Teal active tab, teal CTA, 10px rounded inputs.
  ForgotPasswordPage: same right-panel form style. 6 individual OTP digit boxes horizontal.

### Super Admin Panel
  CSS wrapper: .sa-panel
  Sidebar: two-level (icon strip + labeled nav, both white). Green #00C37F active highlight. Category labels uppercase sm.
  Content: #F4F5F7 bg. White cards, 8px radius, subtle shadow.
  KPI cards: icon + large number + trend arrow. Charts: Recharts BarChart (green)  + PieChart.
  SchoolsListPage: CARD GRID ONLY — never DataTable.

### School Panel (All School Roles)
  CSS wrapper: .school-panel
  Sidebar: solid blue #0B9ADB, white icons/text, semi-transparent active highlight.
  Header: white bar — school name left, search center, bell + avatar right.
  Content: #EAF5FF light blue bg. White cards, 8px radius, subtle shadow.
  Finance (FeesPage, SalariesPage): charts top row → tab filter row → dense DataTable below.
    Status dot badges: ●paid=green, ●unpaid=red, ●overdue=amber.

### Shared Components
  DataTable: striped (#F9FAFB even rows). Sortable headers.
  StatsCard: white card, colored icon circle, large bold number, trend indicator.
  StatusBadge: pill, color-coded per domain status.
  Modal: Framer Motion fadeIn+slideUp. Overlay. Sticky footer.

---

## 11. KEY DECISIONS (non-negotiable)

  01. JSX ONLY. No TypeScript anywhere, ever.
  02. Shared MongoDB DB with schoolId scoping — NOT separate DB per school.
  03. Models in src/models/ (shared), NOT inside feature folders.
  04. Services in src/services/ (shared), NOT inside feature folders.
  05. Axios 401 interceptor handles ONLY 401. All other errors → rejectWithValue.
  06. No caching layer in v1.
  07. Students = User (role:'student'). Parents = User (role:'parent'). Linked via User.studentIds[].
  08. mustChangePassword = amber banner on ProfilePage. NOT a route redirect.
  09. Real-time = Socket.io only. No SSE, no long-polling.
  10. Report cards = pdfkit backend PDF stream. NOT client-side PDF.
  11. Charts = Recharts. NOT Chart.js or any other library.
  12. SchoolsListPage = card grid. NOT a DataTable. (User decision.)
  13. Dashboard (COMP-23) = FE ONLY. No backend aggregation endpoint.
  14. auditWriter = backend utility. NEVER called from frontend API.
  15. Landing page at /. Authenticated users redirect to /dashboard.
  16. OTP: 6-digit, bcrypt-hashed, 5-min TTL MongoDB collection, delete on first use.
  17. OTP delivery: Twilio SMS primary → Nodemailer email fallback (automatic).
  18. Tokens: access 15min localStorage | refresh 7d httpOnly cookie.
  19. Soft delete for users: isActive:false. No hard deletes.
  20. School suspension: school.isActive=false checked by suspensionCheck middleware.
  21. No barrel files. No @/ alias. Relative imports only.
  22. ESLint Airbnb + Prettier. Both enforced.
  23. Stitch MCP used for design mockups during planning only. All code written by Chat 3.
  24. INFRA-04 seed runs after COMP-01 integration. Idempotent (clears before re-seeding).
  25. Report cards endpoint lives in src/features/settings/ router.

---

## 12. START INSTRUCTIONS FOR CHAT 3

  1. Read shared/conventions.md completely before touching any code.
  2. Read shared/api-contracts.md — update after every backend task completes.
  3. Read shared/socket-events.md before any Socket.io work.
  4. Start at UTIL-01 in the Build Order. Do not skip or reorder.
  5. After every backend.md task: run the backend review checklist (Section 5).
  6. After every frontend.md task: run the frontend review checklist (Section 5).
  7. After every integration-review: update api-contracts.md with full endpoint details.
  8. Request user approval after each integration-review before proceeding to next unit.
  9. Generate .docs/capsules/<component>.md after each integration review.
  10. Never modify protected files except by adding (one line) to them.
