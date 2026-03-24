import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { LIGHT } from '../../middleware/rateLimiter.js';
import { generateReportCard } from './reportCardController.js';

const router = Router();

// GET /api/v1/report-cards/:studentId/exam/:examId
// Generate and download a report card PDF
router.get(
  '/:studentId/exam/:examId',
  LIGHT,
  authenticate,
  generateReportCard
);

export default router;
