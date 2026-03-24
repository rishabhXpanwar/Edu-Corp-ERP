import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import {
  saveMarksValidator,
  publishValidator,
  getSectionMarksValidator,
  getStudentMarksValidator,
} from './marksValidators.js';
import {
  saveMarks,
  getSectionMarks,
  publishMarks,
  getStudentMarks,
} from './marksController.js';

const router = Router();

// All routes require authentication and school scoping
router.use(authenticate, scopeToSchool);

// POST /marks — Save marks for a section (bulk entry)
router.post(
  '/',
  MODERATE,
  authorize('teacher', 'academicManager', 'manager', 'principal'),
  validate(saveMarksValidator),
  saveMarks,
);

// GET /marks/exam/:examId/section/:sectionId — Get section marks
router.get(
  '/exam/:examId/section/:sectionId',
  LIGHT,
  validate(getSectionMarksValidator),
  getSectionMarks,
);

// PATCH /marks/exam/:examId/section/:sectionId/publish — Publish marks
router.patch(
  '/exam/:examId/section/:sectionId/publish',
  MODERATE,
  authorize('academicManager', 'manager', 'principal'),
  validate(publishValidator),
  publishMarks,
);

// GET /marks/student/:studentId/exam/:examId — Get student marks
router.get(
  '/student/:studentId/exam/:examId',
  LIGHT,
  validate(getStudentMarksValidator),
  getStudentMarks,
);

export default router;
