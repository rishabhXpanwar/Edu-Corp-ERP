import express from 'express';
import { validationResult } from 'express-validator';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { suspensionCheck } from '../../middleware/suspensionCheck.js';
import { uploadSingle } from '../../middleware/uploadMiddleware.js';
import { settingsUpdateValidator } from './settingsValidators.js';
import { getSettings, updateSettings } from './settingsController.js';

const router = express.Router();

const validateSettingsUpdate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
    });
  }

  return next();
};

router.get(
  '/',
  LIGHT,
  authenticate,
  scopeToSchool,
  authorize('principal'),
  getSettings,
);

router.put(
  '/',
  MODERATE,
  authenticate,
  scopeToSchool,
  suspensionCheck,
  authorize('principal'),
  uploadSingle('logo'),
  ...settingsUpdateValidator,
  validateSettingsUpdate,
  updateSettings,
);

export default router;
