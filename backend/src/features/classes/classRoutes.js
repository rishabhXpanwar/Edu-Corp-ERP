import express from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { validate } from '../../middleware/validate.js';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import {
  createAcademicYearValidator,
  createClassValidator,
  updateClassValidator,
  createSectionValidator,
  updateSectionValidator,
  idParamValidator,
  sectionIdParamValidator,
} from './classValidators.js';
import {
  getAcademicYears,
  createAcademicYear,
  setCurrentAcademicYear,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  createSection,
  updateSection,
  deleteSection,
} from './classController.js';

const router = express.Router();

// ==================== ACADEMIC YEARS ====================
// GET /academic-years
router.get(
  '/academic-years',
  LIGHT,
  authenticate,
  scopeToSchool,
  getAcademicYears,
);

// POST /academic-years
router.post(
  '/academic-years',
  MODERATE,
  authenticate,
  scopeToSchool,
  authorize('principal', 'academicManager'),
  validate(createAcademicYearValidator),
  createAcademicYear,
);

// PATCH /academic-years/:id/current
router.patch(
  '/academic-years/:id/current',
  MODERATE,
  authenticate,
  scopeToSchool,
  authorize('principal', 'academicManager'),
  validate(idParamValidator),
  setCurrentAcademicYear,
);

// ==================== CLASSES ====================
// GET /classes
router.get(
  '/classes',
  LIGHT,
  authenticate,
  scopeToSchool,
  getClasses,
);

// POST /classes
router.post(
  '/classes',
  MODERATE,
  authenticate,
  scopeToSchool,
  authorize('principal', 'academicManager'),
  validate(createClassValidator),
  createClass,
);

// PUT /classes/:id
router.put(
  '/classes/:id',
  MODERATE,
  authenticate,
  scopeToSchool,
  authorize('principal', 'academicManager'),
  validate([...idParamValidator, ...updateClassValidator]),
  updateClass,
);

// DELETE /classes/:id
router.delete(
  '/classes/:id',
  MODERATE,
  authenticate,
  scopeToSchool,
  authorize('principal', 'academicManager'),
  validate(idParamValidator),
  deleteClass,
);

// ==================== SECTIONS ====================
// POST /classes/:id/sections
router.post(
  '/classes/:id/sections',
  MODERATE,
  authenticate,
  scopeToSchool,
  authorize('principal', 'academicManager'),
  validate([...idParamValidator, ...createSectionValidator]),
  createSection,
);

// PUT /classes/:id/sections/:secId
router.put(
  '/classes/:id/sections/:secId',
  MODERATE,
  authenticate,
  scopeToSchool,
  authorize('principal', 'academicManager'),
  validate([...sectionIdParamValidator, ...updateSectionValidator]),
  updateSection,
);

// DELETE /classes/:id/sections/:secId
router.delete(
  '/classes/:id/sections/:secId',
  MODERATE,
  authenticate,
  scopeToSchool,
  authorize('principal', 'academicManager'),
  validate(sectionIdParamValidator),
  deleteSection,
);

export default router;
