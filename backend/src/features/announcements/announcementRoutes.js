import express from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { validate } from '../../middleware/validate.js';
import { MODERATE, LIGHT } from '../../middleware/rateLimiter.js';
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  deleteAnnouncement,
} from './announcementController.js';
import { createAnnouncementSchema } from './announcementValidators.js';

const router = express.Router();

router.post(
  '/',
  MODERATE,
  authenticate,
  authorize('principal', 'academicManager', 'adminManager', 'hrManager', 'financeManager'),
  scopeToSchool,
  validate(createAnnouncementSchema),
  createAnnouncement,
);

router.get(
  '/',
  LIGHT,
  authenticate,
  scopeToSchool,
  getAnnouncements,
);

router.get(
  '/:id',
  LIGHT,
  authenticate,
  scopeToSchool,
  getAnnouncementById,
);

router.delete(
  '/:id',
  MODERATE,
  authenticate,
  authorize('principal', 'academicManager', 'adminManager', 'hrManager', 'financeManager'),
  scopeToSchool,
  deleteAnnouncement,
);

export default router;
