import leaveService from '../../services/leaveService.js';
import { auditWriter } from '../../utils/auditWriter.js';

export const applyLeave = async (req, res, next) => {
  console.log('[CTRL] applyLeave called');

  try {
    const {
      type,
      startDate,
      endDate,
      reason,
      attachmentUrl,
    } = req.body;

    const leaveRequest = await leaveService.applyLeave({
      schoolId: req.schoolId,
      applicantId: req.user._id,
      type,
      startDate,
      endDate,
      reason,
      attachmentUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Leave applied successfully',
      data: { leaveRequest },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyHistory = async (req, res, next) => {
  console.log('[CTRL] getMyHistory called');

  try {
    const { page = '1', limit = '20' } = req.query;

    const history = await leaveService.getMyHistory(req.schoolId, req.user._id, {
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      message: 'History retrieved',
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export const getApprovalQueue = async (req, res, next) => {
  console.log('[CTRL] getApprovalQueue called');

  try {
    const { page = '1', limit = '20', status } = req.query;

    const queue = await leaveService.getApprovalQueue(req.schoolId, {
      status,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      message: 'Queue retrieved',
      data: queue,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewLeave = async (req, res, next) => {
  console.log('[CTRL] reviewLeave called');

  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body;

    const leaveRequest = await leaveService.reviewLeave({
      schoolId: req.schoolId,
      leaveRequestId: id,
      status,
      reviewNote,
      reviewerId: req.user._id,
    });

    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'REVIEW_LEAVE',
      targetModel: 'LeaveRequest',
      targetId: leaveRequest._id,
      metadata: {
        status,
        reviewNote: reviewNote || '',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Leave request reviewed',
      data: { leaveRequest },
    });
  } catch (error) {
    next(error);
  }
};
