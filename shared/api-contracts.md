# API Contracts

This file defines the format and requirements for API endpoints. It is appended
to iteratively as each backend component is planned.

## General Format
- Base URL: `http://localhost:5000/api/v1`
- Response format:
  ```json
  {
    "success": true, // or false
    "message": "Human readable message",
    "data": { ... } // Payload (optional on success, omitted on failure)
    "errors": [ ... ] // Array of validation errors (optional, only on 422)
  }
  ```
- Paginated response `data` format:
  ```json
  {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
  ```

---

## INFRASTRUCTURE (INFRA-01)
### GET `/health`
- **Auth**: None
- **Response**: `{ status: "ok", uptime: number, timestamp: string }`

---

## AUTHENTICATION (COMP-01)
### POST `/auth/login/email`
- **Auth**: None
- **Body**: `{ email, password }`
- **Response**: `{ user: { id, name, email, role, schoolId }, accessToken }` (refresh token in cookie)

### POST `/auth/send-otp`
- **Auth**: None
- **Body**: `{ phone }`
- **Response**: Success message

### POST `/auth/login/otp`
- **Auth**: None
- **Body**: `{ phone, otp }`
- **Response**: Same as `/auth/login/email`

### POST `/auth/refresh`
- **Auth**: Requires valid `refreshToken` cookie.
- **Response**: `{ accessToken }` (new refresh token in cookie)

### POST `/auth/logout`
- **Auth**: None (clears cookie)
- **Response**: Success message

### POST `/auth/forgot-password`
- **Auth**: None
- **Body**: `{ email }`
- **Response**: Success message

### POST `/auth/reset-password`
- **Auth**: None
- **Body**: `{ token, newPassword }`
- **Response**: Success message

---

## SUPER ADMIN: SCHOOLS (COMP-03)
### GET `/schools/dashboard/stats`
- **Auth**: `superAdmin`
- **Response**: `{ totalSchools, activeSchools, totalStudents, revenueThisMonth }`

### GET `/schools`
- **Auth**: `superAdmin`
- **Query**: `page`, `limit`, `search` (optional)
- **Response**: Paginated `School` items with populated `principalId`.

### GET `/schools/:id`
- **Auth**: `superAdmin`
- **Response**: `School` object populated with `principalId` and `subscription` details.

### POST `/schools`
- **Auth**: `superAdmin`
- **Body**: `{ name, address, phone, email, principalName, principalEmail, principalPhone, plan }`
- **Response**: New `School` object.

### PATCH `/schools/:id/suspend`
- **Auth**: `superAdmin`
- **Response**: Success message.

### PATCH `/schools/:id/reactivate`
- **Auth**: `superAdmin`
- **Response**: Success message.

---

## SUPER ADMIN: SUBSCRIPTIONS (COMP-04)
### GET `/subscriptions`
- **Auth**: `superAdmin`
- **Query**: `page`, `limit`, `status`
- **Response**: Paginated `Subscription` items.

### GET `/subscriptions/:id`
- **Auth**: `superAdmin`
- **Response**: `Subscription` object populated with `schoolId`.

### PATCH `/subscriptions/:id/plan`
- **Auth**: `superAdmin`
- **Body**: `{ plan }`
- **Response**: Success message.

### POST `/subscriptions/:id/billing`
- **Auth**: `superAdmin`
- **Body**: `{ amount, method, receiptUrl }`
- **Response**: Success message.

---

## PROFILE (COMP-05)
### GET `/users/profile`
- **Auth**: `yes`
- **Response**: User object

### PUT `/users/profile`
- **Auth**: `yes`
- **Body**: `{ firstName, lastName, phone }`
- **Response**: Updated User object

### PUT `/users/password`
- **Auth**: `yes`
- **Body**: `{ currentPassword, newPassword }`
- **Response**: Success message

---

## CLASSES, SECTIONS & ACADEMIC YEARS (COMP-06)
### POST `/academic-years`
- **Auth**: `principal`, `academicManager`
- **Body**: `{ name, startDate, endDate }`
- **Response**: AcademicYear object

### GET `/academic-years`
- **Auth**: `yes`
- **Response**: Array of AcademicYear objects

### PATCH `/academic-years/:id/current`
- **Auth**: `principal`, `academicManager`
- **Response**: Success message

### POST `/classes`
- **Auth**: `principal`, `academicManager`
- **Body**: `{ name, level, academicYearId }`
- **Response**: Class object

### GET `/classes`
- **Auth**: `yes`
- **Response**: Array of Class objects with their sections populated

### PUT `/classes/:id`
- **Auth**: `principal`, `academicManager`
- **Body**: `{ name, level }`
- **Response**: Updated Class object

### DELETE `/classes/:id`
- **Auth**: `principal`, `academicManager`
- **Response**: Success message

### POST `/classes/:id/sections`
- **Auth**: `principal`, `academicManager`
- **Body**: `{ name, classTeacherId }`
- **Response**: Section object

### PUT `/classes/:id/sections/:secId`
- **Auth**: `principal`, `academicManager`
- **Body**: `{ name, classTeacherId }`
- **Response**: Updated Section object

### DELETE `/classes/:id/sections/:secId`
- **Auth**: `principal`, `academicManager`
- **Response**: Success message

---

## STUDENTS (COMP-07)
### POST `/students`
- **Auth**: `principal`, `adminManager`
- **Body**: Complex nested object containing student and parent details
- **Response**: Created Student and Parent User objects

### GET `/students`
- **Auth**: `yes`
- **Query**: pagination, `classId`, `sectionId`
- **Response**: Paginated Student objects

### GET `/students/:id`
- **Auth**: `yes`
- **Response**: Student and Parent User objects

### PUT `/students/:id`
- **Auth**: `principal`, `adminManager`
- **Body**: Partial student/parent updates
- **Response**: Updated User object

### PATCH `/students/:id/deactivate`
- **Auth**: `principal`, `adminManager`
- **Response**: Success message

---

## TEACHERS & MANAGERS (COMP-08)
### POST `/users/teachers`
- **Auth**: `principal`, `hrManager`
- **Body**: Teacher user fields
- **Response**: Created User object

### GET `/users/teachers`
- **Auth**: `yes`
- **Response**: Paginated Teacher objects

### GET `/users/teachers/:id`
- **Auth**: `yes`
- **Response**: Teacher User object

### POST `/users/managers`
- **Auth**: `principal`, `hrManager`
- **Body**: Manager user fields
- **Response**: Created User object

### GET `/users/managers`
- **Auth**: `yes`
- **Response**: Paginated Manager objects

### PATCH `/users/:id/status`
- **Auth**: `principal`, `hrManager`
- **Body**: `{ isActive }`
- **Response**: Success message

---

## ATTENDANCE (COMP-09)
### POST `/attendance`
- **Auth**: `teacher`, `principal`, `academicManager`
- **Body**: `{ date, sectionId, classId, records: [{ studentId, status }] }`
- **Response**: Saved Attendance object

### GET `/attendance/section/:id`
- **Auth**: `yes`
- **Query**: `date, month, year`
- **Response**: Attendance records for section

### GET `/attendance/student/:id`
- **Auth**: `yes`
- **Query**: `date, month, year`
- **Response**: Attendance records for student

### GET `/attendance/report`
- **Auth**: `yes`
- **Query**: `sectionId, classId, month, year`
- **Response**: Computed attendance statistics

---

## TIMETABLE (COMP-10)
### PUT `/timetable/:sectionId`
- **Auth**: `superAdmin`, `principal`, `academicManager`, `manager`
- **Body**: `{ schedule: [{ day, periods: [{ subject, teacherId, startTime, endTime }] }] }`
- **Response**: Updated Timetable object

### GET `/timetable/:sectionId`
- **Auth**: `yes`
- **Response**: Timetable object for the section

### GET `/timetable/me`
- **Auth**: `yes`
- **Response**: Teacher's weekly periods or Student's section timetable

---

## EXAMS (COMP-11)
### POST `/exams`
- **Auth**: `superAdmin`, `principal`, `academicManager`, `manager`
- **Body**: `{ title, startDate, endDate, classes, dateSheet: [{ classId, sectionId, subject, date, startTime, endTime }] }`
- **Response**: Created Exam object

### GET `/exams`
- **Auth**: `yes`
- **Query**: `status`, `year`
- **Response**: Array of Exam objects

### GET `/exams/:id`
- **Auth**: `yes`
- **Response**: Exam object with populated dateSheet details

### PUT `/exams/:id`
- **Auth**: `superAdmin`, `principal`, `academicManager`, `manager`
- **Body**: Partial exam updates
- **Response**: Updated Exam object

### DELETE `/exams/:id`
- **Auth**: `superAdmin`, `principal`, `academicManager`, `manager`
- **Response**: Success message

---

## MARKS & RESULTS (COMP-12)
### POST `/marks`
- **Auth**: `teacher`, `academicManager`, `manager`, `principal`
- **Body**: `{ examId, sectionId, marksData: [{ studentId, subjects: [{ subjectName, totalMarks, obtainedMarks }] }] }`
- **Response**: Built array of Marks objects

### GET `/marks/exam/:examId/section/:sectionId`
- **Auth**: `yes`
- **Response**: Array of Marks objects for the section

### PATCH `/marks/exam/:examId/section/:sectionId/publish`
- **Auth**: `academicManager`, `manager`, `principal`
- **Response**: Success message

### GET `/marks/student/:studentId/exam/:examId`
- **Auth**: `yes`
- **Response**: Marks object for the student (only if published, unless requester is admin/teacher)

---

## REPORT CARDS (COMP-13)
### GET `/report-cards/:studentId/exam/:examId`
- **Auth**: `yes`
- **Response**: PDF file stream (`application/pdf`)

---

## ASSIGNMENTS (COMP-14)
### POST `/assignments`
- **Auth**: `teacher`, `academicManager`, `principal`
- **Body**: `{ title, description, subject, classId, sectionId, dueDate, attachments: [{ name, url, type }] }`
- **Response**: Created Assignment object

### GET `/assignments/section/:sectionId`
- **Auth**: `yes`
- **Query**: `status`, `year`
- **Response**: Array of Assignment objects

### GET `/assignments/:id`
- **Auth**: `yes`
- **Response**: Assignment object

### DELETE `/assignments/:id`
- **Auth**: `teacher`, `academicManager`, `principal`
- **Response**: Success message

---

## FEES (COMP-15)
### POST `/fees`
- **Auth**: `principal`, `financeManager`
- **Body**: `{ studentId, classId, title, amount, dueDate }`
- **Response**: Created Fee object

### GET `/fees`
- **Auth**: `principal`, `financeManager`
- **Query**: `page`, `limit`, `status`, `classId`
- **Response**: Paginated Fee objects

### GET `/fees/student/:id`
- **Auth**: `yes`
- **Response**: Array of Fee objects for the student

### PATCH `/fees/:id/paid`
- **Auth**: `principal`, `financeManager`
- **Body**: `{ paymentMethod }`
- **Response**: Updated Fee object

### PATCH `/fees/:id/unpaid`
- **Auth**: `principal`, `financeManager`
- **Response**: Updated Fee object

---

## SALARIES (COMP-16)
### POST `/salaries`
- **Auth**: `principal`, `financeManager`
- **Body**: `{ teacherId, month, year, baseSalary, deductions, totalAmount }`
- **Response**: Created Salary object

### GET `/salaries`
- **Auth**: `principal`, `financeManager`
- **Query**: `page`, `limit`, `month`, `year`, `status`
- **Response**: Paginated Salary objects

### GET `/salaries/teacher/:id`
- **Auth**: `yes`
- **Response**: Array of Salary objects for the teacher

### PATCH `/salaries/:id/paid`
- **Auth**: `principal`, `financeManager`
- **Body**: `{ paymentMethod }`
- **Response**: Updated Salary object

### PATCH `/salaries/:id/unpaid`
- **Auth**: `principal`, `financeManager`
- **Response**: Updated Salary object

---

## LEAVE MANAGEMENT (COMP-17)
### POST `/leave`
- **Auth**: `yes`
- **Body**: `{ type, startDate, endDate, reason, attachmentUrl }`
- **Response**: Created LeaveRequest object

### GET `/leave/my`
- **Auth**: `yes`
- **Query**: `page`, `limit`
- **Response**: Paginated LeaveRequest objects

### GET `/leave/queue`
- **Auth**: `principal`, `hrManager`, `adminManager`
- **Query**: `page`, `limit`, `status`
- **Response**: Paginated LeaveRequest objects

### PATCH `/leave/:id/review`
- **Auth**: `principal`, `hrManager`, `adminManager`
- **Body**: `{ status, reviewNote }`
- **Response**: Updated LeaveRequest object

---

## LIBRARY (COMP-18)
### POST `/library`
- **Auth**: `principal`, `academicManager`, `adminManager`
- **Body**: `{ title, author, isbn, category, totalCopies }`
- **Response**: Created LibraryBook object

### GET `/library`
- **Auth**: `yes`
- **Query**: `page`, `limit`, `search`, `category`
- **Response**: Paginated LibraryBook objects

### GET `/library/:id`
- **Auth**: `yes`
- **Response**: LibraryBook object

### PUT `/library/:id`
- **Auth**: `principal`, `academicManager`, `adminManager`
- **Body**: Updates payload
- **Response**: Updated LibraryBook object

### DELETE `/library/:id`
- **Auth**: `principal`, `academicManager`, `adminManager`
- **Response**: Success message

### POST `/library/:id/issue`
- **Auth**: `principal`, `academicManager`, `adminManager`, `teacher`
- **Body**: `{ userId, dueDate }`
- **Response**: Updated LibraryBook object

### POST `/library/:id/return`
- **Auth**: `principal`, `academicManager`, `adminManager`, `teacher`
- **Body**: `{ userId }`
- **Response**: Updated LibraryBook object

---

## TRANSPORT (COMP-19)
### POST `/transport`
- **Auth**: `principal`, `adminManager`
- **Body**: `{ routeName, vehicleNumber, driverName, driverPhone, stops }`
- **Response**: Created Transport route object

### GET `/transport`
- **Auth**: `yes`
- **Response**: Array of Transport routes

### GET `/transport/:id`
- **Auth**: `yes`
- **Response**: Transport route object

### PUT `/transport/:id`
- **Auth**: `principal`, `adminManager`
- **Body**: Updates payload
- **Response**: Updated Transport route object

### DELETE `/transport/:id`
- **Auth**: `principal`, `adminManager`
- **Response**: Success message

### POST `/transport/:id/assign`
- **Auth**: `principal`, `adminManager`
- **Body**: `{ studentId }`
- **Response**: Updated Transport route object

### POST `/transport/:id/unassign`
- **Auth**: `principal`, `adminManager`
- **Body**: `{ studentId }`
- **Response**: Updated Transport route object

---

## NOTIFICATIONS (COMP-20)
### POST `/notifications`
- **Auth**: `teacher`, `principal`, `academicManager`, `adminManager`, `hrManager`, `financeManager`
- **Body**: `{ type: 'individual'|'section'|'class', message, recipientId?, sectionId?, classId? }`
- **Response**: `{ notification: { _id, schoolId, senderId, recipientId?, sectionId?, classId?, type, message, isRead, createdAt } }`
- **Side effect**: Emits `notification:new` socket event to `user:<recipientId>` (individual) or `class:<classId>` (section/class)

### GET `/notifications`
- **Auth**: `yes`
- **Query**: `page`, `limit`, `type?`
- **Response**: Paginated Notification objects. If sender role: returns sent notifications. If student/parent: returns received notifications.

### PATCH `/notifications/read`
- **Auth**: `yes`
- **Body**: `{ notificationIds: [ObjectId, ...] }`
- **Response**: `{ modifiedCount: number }`

### GET `/notifications/unread-count`
- **Auth**: `yes`
- **Response**: `{ unreadCount: number }`

---

## ANNOUNCEMENTS (COMP-21)
### POST `/announcements`
- **Auth**: `principal`, `academicManager`, `adminManager`, `hrManager`, `financeManager`
- **Body**: `{ title, body, audience: 'all'|'staff'|'students' }`
- **Response**: Created Announcement object

### GET `/announcements`
- **Auth**: `yes`
- **Query**: `page`, `limit`, `audience?`
- **Response**: Paginated Announcement objects (newest first), populated with authorId (name, role)

### GET `/announcements/:id`
- **Auth**: `yes`
- **Response**: Single Announcement object

### DELETE `/announcements/:id`
- **Auth**: `yes` (only author or principal can delete)
- **Response**: Success message

---

## CALENDAR (COMP-22)
### POST `/calendar`
- **Auth**: `principal`, `academicManager`, `adminManager`
- **Body**: `{ title, type: 'holiday'|'exam'|'event', startDate, endDate, description? }`
- **Response**: Created CalendarEvent object

### GET `/calendar`
- **Auth**: `yes`
- **Query**: `month` (1–12), `year` (e.g., 2025)
- **Response**: `{ events: [...] }` — non-paginated array of events overlapping the month

### PUT `/calendar/:id`
- **Auth**: `principal`, `academicManager`, `adminManager`
- **Body**: Partial: `{ title?, type?, startDate?, endDate?, description? }`
- **Response**: Updated CalendarEvent object

### DELETE `/calendar/:id`
- **Auth**: `principal`, `academicManager`, `adminManager`
- **Response**: Success message

---

## AUDIT LOG (COMP-24)
### GET `/audit`
- **Auth**: `principal`, `adminManager`
- **Query**: `page`, `limit`, `actorId?`, `action?` (keyword match), `targetModel?`, `startDate?`, `endDate?`
- **Response**: Paginated AuditLog objects with populated actorId (name, role)
  Shape: `{ items: [ { actorId:{name,role}, actorRole, schoolId, action, targetModel, targetId, metadata, createdAt } ], total, page, limit, totalPages }`

---

## SETTINGS (COMP-25)
### GET `/settings`
- **Auth**: `principal`
- **Middleware**: authenticate → scopeToSchool → roleMiddleware('principal')
- **Rate**: LIGHT (100 req/min)
- **Response**:
  ```json
  {
    "school": { "_id": "...", "name": "...", "address": "...", "phone": "...", "email": "...", "logo": "https://cloudinary.../...", "isActive": true, "principalId": "..." },
    "currentYear": { "_id": "...", "name": "2025-2026", "startDate": "...", "endDate": "...", "isCurrent": true } 
  }
  ```
  `currentYear` is `null` if no academic year has `isCurrent: true` for this school.

### PUT `/settings`
- **Auth**: `principal`
- **Middleware**: authenticate → scopeToSchool → suspensionCheck → roleMiddleware('principal') → uploadMiddleware.single('logo') → validate
- **Rate**: MODERATE (30 req/min)
- **Body**: `multipart/form-data`
  - `name` (string, optional) — school name
  - `address` (string, optional)
  - `phone` (string, optional)
  - `email` (string, optional)
  - `logo` (file, optional) — image file; uploaded to Cloudinary; stored as `secure_url`
  - At least one field or logo must be provided; 400 if nothing provided
- **Response**: `{ school: { ...updatedSchoolFields } }`
