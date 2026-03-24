import express from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { uploadSingle } from '../../middleware/uploadMiddleware.js';
import { validate } from '../../middleware/validate.js';
import { LIGHT, MODERATE, STRICT } from '../../middleware/rateLimiter.js';
import {
  updateProfileValidator,
  updatePasswordValidator,
  createTeacherValidator,
  createManagerValidator,
  updateUserStatusValidator,
  idParamValidator,
  listQueryValidator,
} from './userValidators.js';
import {
  getProfile,
  updateProfile,
  updatePassword,
  getTeachers,
  getTeacherById,
  createTeacher,
  getManagers,
  createManager,
  updateUserStatus,
} from './userController.js';

const router = express.Router();

// ==================== PROFILE ROUTES ====================

router.get('/profile', LIGHT, authenticate, getProfile);
router.put(
  '/profile',
  MODERATE,
  authenticate,
  uploadSingle('avatar'),
  validate(updateProfileValidator),
  updateProfile,
);
router.put(
  '/password',
  STRICT,
  authenticate,
  validate(updatePasswordValidator),
  updatePassword,
);

// ==================== TEACHER ROUTES ====================

router.get(
  '/teachers',
  LIGHT,
  authenticate,
  scopeToSchool,
  validate(listQueryValidator),
  getTeachers,
);

router.get(
  '/teachers/:id',
  LIGHT,
  authenticate,
  scopeToSchool,
  validate(idParamValidator),
  getTeacherById,
);

router.post(
  '/teachers',
  MODERATE,
  authenticate,
  scopeToSchool,
  authorize('principal', 'hrManager'),
  validate(createTeacherValidator),
  createTeacher,
);

// ==================== MANAGER ROUTES ====================

router.get(
  '/managers',
  LIGHT,
  authenticate,
  scopeToSchool,
  validate(listQueryValidator),
  getManagers,
);

router.post(
  '/managers',
  MODERATE,
  authenticate,
  scopeToSchool,
  authorize('principal', 'hrManager'),
  validate(createManagerValidator),
  createManager,
);

// ==================== USER STATUS ROUTE ====================

router.patch(
  '/:id/status',
  MODERATE,
  authenticate,
  scopeToSchool,
  authorize('principal', 'hrManager'),
  validate([...idParamValidator, ...updateUserStatusValidator]),
  updateUserStatus,
);

export default router;
