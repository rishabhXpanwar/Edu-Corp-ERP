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
  SCHOOLS_DASHBOARD_STATS:   '/schools/dashboard/stats',
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
  SALARY_DELAYED:       (id) => `/salaries/${id}/delayed`,
  SALARY_INCREMENT:          '/salaries/increment',
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
};