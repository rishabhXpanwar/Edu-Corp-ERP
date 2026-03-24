import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import {
  validateUpdateTimetable,
  validateGetTimetable,
} from './timetableValidators.js';
import {
  updateTimetable,
  getSectionTimetable,
  getMyTimetable,
} from './timetableController.js';

const router = Router();

// All routes require authentication and school scoping
router.use(authenticate, scopeToSchool);

// GET /timetable/me — Get my timetable (teacher/student)
// NOTE: This route MUST be defined BEFORE /:sectionId to avoid conflicts
router.get(
  '/me',
  LIGHT,
  getMyTimetable,
);

// PUT /timetable/:sectionId — Update section timetable
router.put(
  '/:sectionId',
  MODERATE,
  authorize('superAdmin', 'principal', 'academicManager', 'adminManager'),
  validate(validateUpdateTimetable),
  updateTimetable,
);

// GET /timetable/:sectionId — Get section timetable
router.get(
  '/:sectionId',
  LIGHT,
  validate(validateGetTimetable),
  getSectionTimetable,
);

export default router;
