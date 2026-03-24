import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import {
  createExamValidator,
  updateExamValidator,
  examIdParamValidator,
  getExamsQueryValidator,
} from './examValidators.js';
import {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
} from './examController.js';

const router = Router();

// All routes require authentication and school scoping
router.use(authenticate, scopeToSchool);

// POST /exams — Create a new exam
router.post(
  '/',
  MODERATE,
  authorize('superAdmin', 'principal', 'academicManager', 'manager'),
  validate(createExamValidator),
  createExam,
);

// GET /exams — Get all exams with optional filters
router.get(
  '/',
  LIGHT,
  validate(getExamsQueryValidator),
  getExams,
);

// GET /exams/:examId — Get exam by ID
router.get(
  '/:examId',
  LIGHT,
  validate(examIdParamValidator),
  getExamById,
);

// PUT /exams/:examId — Update exam
router.put(
  '/:examId',
  MODERATE,
  authorize('superAdmin', 'principal', 'academicManager', 'manager'),
  validate([...examIdParamValidator, ...updateExamValidator]),
  updateExam,
);

// DELETE /exams/:examId — Delete exam
router.delete(
  '/:examId',
  MODERATE,
  authorize('superAdmin', 'principal', 'academicManager', 'manager'),
  validate(examIdParamValidator),
  deleteExam,
);

export default router;
