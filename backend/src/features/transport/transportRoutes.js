import express from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { validate } from '../../middleware/validate.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import { suspensionCheck } from '../../middleware/suspensionCheck.js';
import {
  createTransport,
  getTransports,
  getTransport,
  updateTransport,
  deleteTransport,
  assignStudent,
  unassignStudent,
} from './transportController.js';
import {
  createTransportValidator,
  updateTransportValidator,
  getTransportValidator,
  deleteTransportValidator,
  assignStudentValidator,
} from './transportValidators.js';

const router = express.Router();

// POST / — Create a new transport route
router.post(
  '/',
  MODERATE,
  authenticate,
  authorize('principal', 'adminManager'),
  validate(createTransportValidator),
  scopeToSchool,
  createTransport,
);

// GET / — Get all transport routes
router.get(
  '/',
  LIGHT,
  authenticate,
  scopeToSchool,
  getTransports,
);

// GET /:id — Get a single transport route
router.get(
  '/:id',
  LIGHT,
  authenticate,
  validate(getTransportValidator),
  scopeToSchool,
  getTransport,
);

// PUT /:id — Update a transport route
router.put(
  '/:id',
  MODERATE,
  authenticate,
  authorize('principal', 'adminManager'),
  validate(updateTransportValidator),
  scopeToSchool,
  updateTransport,
);

// DELETE /:id — Delete a transport route
router.delete(
  '/:id',
  MODERATE,
  authenticate,
  authorize('principal', 'adminManager'),
  validate(deleteTransportValidator),
  scopeToSchool,
  deleteTransport,
);

// POST /:id/assign — Assign a student to a transport route
router.post(
  '/:id/assign',
  MODERATE,
  authenticate,
  authorize('principal', 'adminManager'),
  validate(assignStudentValidator),
  scopeToSchool,
  suspensionCheck,
  assignStudent,
);

// POST /:id/unassign — Unassign a student from a transport route
router.post(
  '/:id/unassign',
  MODERATE,
  authenticate,
  authorize('principal', 'adminManager'),
  scopeToSchool,
  suspensionCheck,
  unassignStudent,
);

export default router;
