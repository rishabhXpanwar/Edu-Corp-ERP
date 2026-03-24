import { Router } from 'express';
import {
  getSubscriptions,
  getSubscriptionById,
  updatePlan,
  recordBilling,
} from './subscriptions.controller.js';
import {
  updatePlanSchema,
  recordPaymentSchema,
  subscriptionIdParamSchema,
} from './subscriptions.validation.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate, authorize('superAdmin'));

router.get('/', getSubscriptions);
router.get('/:id', validate(subscriptionIdParamSchema), getSubscriptionById);
router.patch('/:id/plan', validate([...subscriptionIdParamSchema, ...updatePlanSchema]), updatePlan);
router.post('/:id/billing', validate([...subscriptionIdParamSchema, ...recordPaymentSchema]), recordBilling);

export default router;
