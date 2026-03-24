import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { validate } from '../../middleware/validate.js';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import * as assignmentController from './assignmentController.js';
import {
  createAssignmentValidator,
  paramsValidator,
  sectionParamsValidator,
} from './assignmentValidators.js';

const router = Router();

// POST /api/v1/assignments
// Create a new assignment
router.post(
  '/',
  MODERATE,
  authenticate,
  authorize('teacher', 'academicManager', 'principal'),
  validate(createAssignmentValidator),
  assignmentController.createAssignment
);

// GET /api/v1/assignments/section/:sectionId
// Get assignments for a section
router.get(
  '/section/:sectionId',
  LIGHT,
  authenticate,
  validate(sectionParamsValidator),
  assignmentController.getSectionAssignments
);

// GET /api/v1/assignments/:id
// Get assignment by ID
router.get(
  '/:id',
  LIGHT,
  authenticate,
  validate(paramsValidator),
  assignmentController.getAssignmentById
);

// DELETE /api/v1/assignments/:id
// Delete assignment by ID
router.delete(
  '/:id',
  MODERATE,
  authenticate,
  authorize('teacher', 'academicManager', 'principal'),
  validate(paramsValidator),
  assignmentController.deleteAssignment
);

export default router;
