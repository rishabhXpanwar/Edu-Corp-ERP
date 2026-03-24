import asyncHandler from '../../utils/asyncHandler.js';
import { generatePDFStream } from './reportCardService.js';

/**
 * @desc    Generate and download a report card PDF for a student
 * @route   GET /api/v1/report-cards/:studentId/exam/:examId
 * @access  Authenticated
 */
export const generateReportCard = asyncHandler(async (req, res, next) => {
  const { studentId, examId } = req.params;
  const schoolId = req.user.schoolId;

  console.log('[reportCardController] generateReportCard — userId:', req.user.userId, 'studentId:', studentId, 'examId:', examId);

  // Generate the PDF stream
  const pdfDoc = await generatePDFStream(schoolId, studentId, examId);

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=report_card_${studentId}_${examId}.pdf`);

  // Pipe the PDF stream to the response
  pdfDoc.pipe(res);

  // Finalize the PDF (this ends the stream)
  pdfDoc.end();

  console.log('[reportCardController] generateReportCard — PDF streamed to response');
});
