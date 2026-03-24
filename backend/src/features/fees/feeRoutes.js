import express from 'express';
import {
  createFee,
  getFees,
  getStudentFees,
  markFeePaid,
  markFeeUnpaid,
} from './feeController.js';
import {
  createFeeValidator,
  statusUpdateValidator,
} from './feeValidators.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { validate } from '../../middleware/validate.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import { suspensionCheck } from '../../middleware/suspensionCheck.js';

const router = express.Router();

router.post(
  '/',
  MODERATE,
  authenticate,
  authorize('principal', 'financeManager'),
  validate(createFeeValidator),
  scopeToSchool,
  createFee
);

router.get(
  '/',
  LIGHT,
  authenticate,
  authorize('principal', 'financeManager'),
  scopeToSchool,
  getFees
);

router.get(
  '/student/:id',
  LIGHT,
  authenticate,
  scopeToSchool,
  getStudentFees
);

router.patch(
  '/:id/paid',
  MODERATE,
  authenticate,
  authorize('principal', 'financeManager'),
  validate(statusUpdateValidator),
  scopeToSchool,
  suspensionCheck,
  markFeePaid
);

router.patch(
  '/:id/unpaid',
  MODERATE,
  authenticate,
  authorize('principal', 'financeManager'),
  scopeToSchool,
  suspensionCheck,
  markFeeUnpaid
);

export default router;
