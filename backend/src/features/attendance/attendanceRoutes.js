import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import {
  markAttendanceValidator,
  sectionIdParamValidator,
  studentIdParamValidator,
  sectionAttendanceQueryValidator,
  studentAttendanceQueryValidator,
  reportQueryValidator,
} from './attendanceValidators.js';
import {
  markAttendance,
  getAttendanceBySection,
  getAttendanceByStudent,
  getAttendanceReport,
} from './attendanceController.js';

const router = Router();

// All routes require authentication and school scoping
router.use(authenticate, scopeToSchool);

// POST /attendance — Mark or update attendance for a section
router.post(
  '/',
  MODERATE,
  authorize('teacher', 'principal', 'academicManager'),
  validate(markAttendanceValidator),
  markAttendance,
);

// GET /attendance/section/:id — Get attendance records for a section
router.get(
  '/section/:id',
  LIGHT,
  validate([...sectionIdParamValidator, ...sectionAttendanceQueryValidator]),
  getAttendanceBySection,
);

// GET /attendance/student/:id — Get attendance records for a student
router.get(
  '/student/:id',
  LIGHT,
  validate([...studentIdParamValidator, ...studentAttendanceQueryValidator]),
  getAttendanceByStudent,
);

// GET /attendance/report — Get computed attendance statistics
router.get(
  '/report',
  LIGHT,
  validate(reportQueryValidator),
  getAttendanceReport,
);

export default router;
