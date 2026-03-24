import * as marksService from './marksService.js';
import { auditWriter } from '../../utils/auditWriter.js';

// ==================== SAVE MARKS ====================

export const saveMarks = async (req, res, next) => {
  try {
    console.log('[Controller] saveMarks — schoolId:', req.schoolId);

    const marks = await marksService.upsertMarksForSection(req.schoolId, req.body);

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'SAVE_MARKS',
      targetModel: 'Marks',
      targetId: null,
      metadata: {
        examId: req.body.examId,
        sectionId: req.body.sectionId,
        studentsCount: req.body.marksData.length,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Marks saved successfully',
      data: { marks },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET SECTION MARKS ====================

export const getSectionMarks = async (req, res, next) => {
  try {
    console.log('[Controller] getSectionMarks — examId:', req.params.examId, 'sectionId:', req.params.sectionId);

    const marks = await marksService.getMarksBySection(
      req.schoolId,
      req.params.examId,
      req.params.sectionId,
    );

    res.status(200).json({
      success: true,
      message: 'Section marks fetched successfully',
      data: { marks },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PUBLISH MARKS ====================

export const publishMarks = async (req, res, next) => {
  try {
    console.log('[Controller] publishMarks — examId:', req.params.examId, 'sectionId:', req.params.sectionId);

    const result = await marksService.publishSectionMarks(
      req.schoolId,
      req.params.examId,
      req.params.sectionId,
    );

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'PUBLISH_MARKS',
      targetModel: 'Marks',
      targetId: null,
      metadata: {
        examId: req.params.examId,
        sectionId: req.params.sectionId,
        modifiedCount: result.modifiedCount,
      },
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET STUDENT MARKS ====================

export const getStudentMarks = async (req, res, next) => {
  try {
    console.log('[Controller] getStudentMarks — studentId:', req.params.studentId, 'examId:', req.params.examId);

    const marks = await marksService.getStudentMarks(
      req.schoolId,
      req.params.studentId,
      req.params.examId,
      req.user.role,
    );

    res.status(200).json({
      success: true,
      message: 'Student marks fetched successfully',
      data: { marks },
    });
  } catch (error) {
    next(error);
  }
};
