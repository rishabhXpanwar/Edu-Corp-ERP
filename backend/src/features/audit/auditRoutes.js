import express from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { LIGHT } from '../../middleware/rateLimiter.js';
import { getAuditLogs } from './auditController.js';

const router = express.Router();

router.get(
  '/',
  LIGHT,
  authenticate,
  scopeToSchool,
  authorize('principal', 'adminManager'),
  getAuditLogs,
);

export default router;
