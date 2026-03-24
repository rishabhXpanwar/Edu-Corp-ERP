import express from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { validate } from '../../middleware/validate.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import { suspensionCheck } from '../../middleware/suspensionCheck.js';
import {
  applyLeave,
  getMyHistory,
  getApprovalQueue,
  reviewLeave,
} from './leaveController.js';
import { applyLeaveValidator, reviewLeaveValidator } from './leaveValidators.js';

const router = express.Router();

router.post(
  '/',
  MODERATE,
  authenticate,
  validate(applyLeaveValidator),
  scopeToSchool,
  applyLeave,
);

router.get(
  '/my',
  LIGHT,
  authenticate,
  scopeToSchool,
  getMyHistory,
);

router.get(
  '/queue',
  LIGHT,
  authenticate,
  authorize('principal', 'hrManager', 'adminManager'),
  scopeToSchool,
  getApprovalQueue,
);

router.patch(
  '/:id/review',
  MODERATE,
  authenticate,
  authorize('principal', 'hrManager', 'adminManager'),
  validate(reviewLeaveValidator),
  scopeToSchool,
  suspensionCheck,
  reviewLeave,
);

export default router;
