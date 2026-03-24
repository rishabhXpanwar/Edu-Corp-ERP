import express from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { validate } from '../../middleware/validate.js';
import { MODERATE, LIGHT } from '../../middleware/rateLimiter.js';
import {
  sendNotification,
  getNotifications,
  markRead,
  getUnreadCount,
} from './notificationController.js';
import {
  sendNotificationSchema,
  markReadSchema,
} from './notificationValidators.js';

const router = express.Router();

router.post(
  '/',
  MODERATE,
  authenticate,
  authorize('teacher', 'principal', 'academicManager', 'adminManager', 'hrManager', 'financeManager'),
  scopeToSchool,
  validate(sendNotificationSchema),
  sendNotification,
);

router.get(
  '/',
  LIGHT,
  authenticate,
  scopeToSchool,
  getNotifications,
);

router.patch(
  '/read',
  MODERATE,
  authenticate,
  scopeToSchool,
  validate(markReadSchema),
  markRead,
);

router.get(
  '/unread-count',
  LIGHT,
  authenticate,
  scopeToSchool,
  getUnreadCount,
);

export default router;
