import { Router } from 'express';
import authRoutes from '../features/auth/auth.routes.js';
import schoolRoutes from '../features/schools/schools.routes.js';
import subscriptionsRoutes from '../features/subscriptions/subscriptions.routes.js';
import userRoutes from '../features/users/userRoutes.js';
import classRoutes from '../features/classes/classRoutes.js';
import studentRoutes from '../features/students/studentRoutes.js';
import attendanceRoutes from '../features/attendance/attendanceRoutes.js';
import timetableRoutes from '../features/timetable/timetableRoutes.js';
import examRoutes from '../features/exams/examRoutes.js';
import marksRoutes from '../features/marks/marksRoutes.js';
import reportCardRoutes from '../features/reportCards/reportCardRoutes.js';
import assignmentRoutes from '../features/assignments/assignmentRoutes.js';
import feeRoutes from '../features/fees/feeRoutes.js';
import salaryRoutes from '../features/salaries/salaryRoutes.js';
import leaveRoutes from '../features/leave/leaveRoutes.js';
import libraryRoutes from '../features/library/libraryRoutes.js';
import transportRoutes from '../features/transport/transportRoutes.js';
import notificationRoutes from '../features/notifications/notificationRoutes.js';
import announcementRoutes from '../features/announcements/announcementRoutes.js';
import calendarRoutes from '../features/calendar/calendarRoutes.js';
import auditRoutes from '../features/audit/auditRoutes.js';
import settingsRoutes from '../features/settings/settingsRoutes.js';

const router = Router();

// PURPOSE: THIS IS THE ONLY FILE WHERE ROUTES ARE MOUNTED. Nothing else mounts routes anywhere.

// Health check — no auth required
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Feature routes are added here as components are built:
router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/users', userRoutes);
router.use('/', classRoutes);
router.use('/students', studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timetable', timetableRoutes);
router.use('/exams', examRoutes);
router.use('/marks', marksRoutes);
router.use('/report-cards', reportCardRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/fees', feeRoutes);
router.use('/salaries', salaryRoutes);
router.use('/leave', leaveRoutes);
router.use('/library', libraryRoutes);
router.use('/transport', transportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/announcements', announcementRoutes);
router.use('/calendar', calendarRoutes);
router.use('/audit', auditRoutes);
router.use('/settings', settingsRoutes);
// ... etc.

export default router;
