import express from 'express';
import {
  createSalary,
  getSalaries,
  getTeacherSalaries,
  markSalaryPaid,
  markSalaryUnpaid,
  markSalaryDelayed,
  applyIncrement,
} from './salaryController.js';
import {
  createSalaryValidator,
  statusUpdateValidator,
} from './salaryValidators.js';
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
  validate(createSalaryValidator),
  scopeToSchool,
  createSalary,
);

router.get(
  '/',
  LIGHT,
  authenticate,
  authorize('principal', 'financeManager'),
  scopeToSchool,
  getSalaries,
);

router.get(
  '/teacher/:id',
  LIGHT,
  authenticate,
  scopeToSchool,
  getTeacherSalaries,
);

router.patch(
  '/:id/paid',
  MODERATE,
  authenticate,
  authorize('principal', 'financeManager'),
  validate(statusUpdateValidator),
  scopeToSchool,
  suspensionCheck,
  markSalaryPaid,
);

router.patch(
  '/:id/unpaid',
  MODERATE,
  authenticate,
  authorize('principal', 'financeManager'),
  validate(statusUpdateValidator),
  scopeToSchool,
  suspensionCheck,
  markSalaryUnpaid,
);

router.patch(
  '/:id/delayed',
  MODERATE,
  authenticate,
  authorize('principal', 'financeManager'),
  scopeToSchool,
  suspensionCheck,
  markSalaryDelayed,
);

router.post(
  '/increment',
  MODERATE,
  authenticate,
  authorize('principal', 'financeManager'),
  scopeToSchool,
  applyIncrement,
);

export default router;
