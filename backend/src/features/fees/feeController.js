import feeService from '../../services/feeService.js';
import AppError from '../../utils/AppError.js';
import { auditWriter } from '../../utils/auditWriter.js';

export const createFee = async (req, res, next) => {
  console.log('[CTRL] createFee called');
  try {
    const { studentId, classId, title, amount, dueDate } = req.body;

    const fee = await feeService.createFee({
      schoolId: req.schoolId,
      studentId,
      classId,
      title,
      amount,
      dueDate,
    });

    auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'Fee Created',
      targetModel: 'Fee',
      targetId: fee._id,
      metadata: { feeId: fee._id, title }
    });

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: { fee },
    });
  } catch (error) {
    next(error);
  }
};

export const getFees = async (req, res, next) => {
  console.log('[CTRL] getFees called');
  try {
    const { page = 1, limit = 10, status, classId, sectionId, studentId, studentName, admissionNumber } = req.query;

    const pagination = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
    
    const filters = {};
    if (status) filters.status = status;
    if (classId) filters.classId = classId;
    if (sectionId) filters.sectionId = sectionId;
    if (studentId) filters.studentId = studentId;
    if (studentName) filters.studentName = studentName;
    if (admissionNumber) filters.admissionNumber = admissionNumber;

    const result = await feeService.getFees(req.schoolId, filters, pagination);

    res.status(200).json({
      success: true,
      message: 'Fees retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentFees = async (req, res, next) => {
  console.log('[CTRL] getStudentFees called');
  try {
    const { id } = req.params;

    const fees = await feeService.getStudentFees(req.schoolId, id);

    res.status(200).json({
      success: true,
      message: 'Student fees retrieved successfully',
      data: { fees },
    });
  } catch (error) {
    next(error);
  }
};

export const markFeePaid = async (req, res, next) => {
  console.log('[CTRL] markFeePaid called');
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const feeExists = await feeService.getFeeById(req.schoolId, id);
    if (!feeExists) {
      return next(new AppError('Fee not found', 404));
    }

    const fee = await feeService.markFeePaid(id, paymentMethod);

    auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'Fee Marked Paid',
      targetModel: 'Fee',
      targetId: fee._id,
      metadata: { feeId: id, paymentMethod }
    });

    res.status(200).json({
      success: true,
      message: 'Fee marked as paid',
      data: { fee },
    });
  } catch (error) {
    next(error);
  }
};

export const markFeeUnpaid = async (req, res, next) => {
  console.log('[CTRL] markFeeUnpaid called');
  try {
    const { id } = req.params;

    const feeExists = await feeService.getFeeById(req.schoolId, id);
    if (!feeExists) {
      return next(new AppError('Fee not found', 404));
    }

    const fee = await feeService.markFeeUnpaid(id);

    auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'Fee Marked Unpaid',
      targetModel: 'Fee',
      targetId: fee._id,
      metadata: { feeId: id }
    });

    res.status(200).json({
      success: true,
      message: 'Fee marked as unpaid',
      data: { fee },
    });
  } catch (error) {
    next(error);
  }
};
