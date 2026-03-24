import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import {
  createStudentValidator,
  updateStudentValidator,
  idParamValidator,
  listStudentsQueryValidator,
} from './studentValidators.js';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deactivateStudent,
} from './studentController.js';

const router = Router();

// All routes require authentication and school scoping
router.use(authenticate, scopeToSchool);

// GET /students — List students with pagination and filters
router.get(
  '/',
  LIGHT,
  validate(listStudentsQueryValidator),
  getStudents,
);

// POST /students — Create student (admission flow)
router.post(
  '/',
  MODERATE,
  authorize('principal', 'adminManager'),
  validate(createStudentValidator),
  createStudent,
);

// GET /students/:id — Get student by ID
router.get(
  '/:id',
  LIGHT,
  validate(idParamValidator),
  getStudentById,
);

// PUT /students/:id — Update student
router.put(
  '/:id',
  MODERATE,
  authorize('principal', 'adminManager'),
  validate([...idParamValidator, ...updateStudentValidator]),
  updateStudent,
);

// PATCH /students/:id/deactivate — Deactivate student
router.patch(
  '/:id/deactivate',
  MODERATE,
  authorize('principal', 'adminManager'),
  validate(idParamValidator),
  deactivateStudent,
);

export default router;
