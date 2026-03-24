import * as examService from './examService.js';
import { auditWriter } from '../../utils/auditWriter.js';

// ==================== CREATE EXAM ====================

export const createExam = async (req, res, next) => {
  try {
    console.log('[Controller] createExam — schoolId:', req.schoolId);

    const exam = await examService.createExam(req.schoolId, req.body);

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'CREATE_EXAM',
      targetModel: 'Exam',
      targetId: exam._id,
      metadata: {
        title: exam.title,
        startDate: exam.startDate,
        endDate: exam.endDate,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: { exam },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET EXAMS ====================

export const getExams = async (req, res, next) => {
  try {
    console.log('[Controller] getExams — schoolId:', req.schoolId);

    const exams = await examService.getExams(req.schoolId, req.query);

    res.status(200).json({
      success: true,
      message: 'Exams fetched successfully',
      data: { exams },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET EXAM BY ID ====================

export const getExamById = async (req, res, next) => {
  try {
    console.log('[Controller] getExamById — examId:', req.params.examId);

    const exam = await examService.getExamById(req.schoolId, req.params.examId);

    res.status(200).json({
      success: true,
      message: 'Exam fetched successfully',
      data: { exam },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE EXAM ====================

export const updateExam = async (req, res, next) => {
  try {
    console.log('[Controller] updateExam — examId:', req.params.examId);

    const exam = await examService.updateExam(
      req.schoolId,
      req.params.examId,
      req.body,
    );

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'UPDATE_EXAM',
      targetModel: 'Exam',
      targetId: exam._id,
      metadata: {
        updates: Object.keys(req.body),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      data: { exam },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE EXAM ====================

export const deleteExam = async (req, res, next) => {
  try {
    console.log('[Controller] deleteExam — examId:', req.params.examId);

    const exam = await examService.deleteExam(req.schoolId, req.params.examId);

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'DELETE_EXAM',
      targetModel: 'Exam',
      targetId: exam._id,
      metadata: {
        title: exam.title,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
