import { Router } from 'express';
import {
  getDashboardStats,
  getSchools,
  getSchoolById,
  createSchool,
  suspendSchool,
  reactivateSchool,
} from './schools.controller.js';
import { createSchoolSchema, schoolIdParamSchema } from './schools.validation.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate, authorize('superAdmin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/', getSchools);
router.post('/', validate(createSchoolSchema), createSchool);
router.get('/:id', validate(schoolIdParamSchema), getSchoolById);
router.patch('/:id/suspend', validate(schoolIdParamSchema), suspendSchool);
router.patch('/:id/reactivate', validate(schoolIdParamSchema), reactivateSchool);

export default router;
