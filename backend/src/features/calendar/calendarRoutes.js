import express from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { validate } from '../../middleware/validate.js';
import { MODERATE, LIGHT } from '../../middleware/rateLimiter.js';
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} from './calendarController.js';
import {
  createEventSchema,
  updateEventSchema,
} from './calendarValidators.js';

const router = express.Router();

router.post(
  '/',
  MODERATE,
  authenticate,
  authorize('principal', 'academicManager', 'adminManager'),
  scopeToSchool,
  validate(createEventSchema),
  createEvent,
);

router.get(
  '/',
  LIGHT,
  authenticate,
  scopeToSchool,
  getEvents,
);

router.put(
  '/:id',
  MODERATE,
  authenticate,
  authorize('principal', 'academicManager', 'adminManager'),
  scopeToSchool,
  validate(updateEventSchema),
  updateEvent,
);

router.delete(
  '/:id',
  MODERATE,
  authenticate,
  authorize('principal', 'academicManager', 'adminManager'),
  scopeToSchool,
  deleteEvent,
);

export default router;
