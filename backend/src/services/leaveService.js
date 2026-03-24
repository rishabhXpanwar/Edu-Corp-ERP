import LeaveRequest from '../models/LeaveRequest.js';
import AppError from '../utils/AppError.js';

class LeaveService {
  async applyLeave({
    schoolId,
    applicantId,
    type,
    startDate,
    endDate,
    reason,
    attachmentUrl,
  }) {
    console.log('[Service] applyLeave starting');

    return LeaveRequest.create({
      schoolId,
      applicantId,
      type,
      startDate,
      endDate,
      reason,
      attachmentUrl: attachmentUrl || undefined,
      status: 'pending',
    });
  }

  async getMyHistory(schoolId, applicantId, { page = 1, limit = 20 } = {}) {
    console.log('[Service] getMyHistory starting');

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Number(limit) || 20);
    const skip = (safePage - 1) * safeLimit;

    const query = {
      schoolId,
      applicantId,
    };

    const [items, total] = await Promise.all([
      LeaveRequest.find(query)
        .populate('reviewerId', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      LeaveRequest.countDocuments(query),
    ]);

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  async getApprovalQueue(schoolId, { status, page = 1, limit = 20 } = {}) {
    console.log('[Service] getApprovalQueue starting');

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Number(limit) || 20);
    const skip = (safePage - 1) * safeLimit;

    const query = {
      schoolId,
      status: status || 'pending',
    };

    const [items, total] = await Promise.all([
      LeaveRequest.find(query)
        .populate('applicantId', 'name email role')
        .populate('reviewerId', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      LeaveRequest.countDocuments(query),
    ]);

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  async reviewLeave({
    schoolId,
    leaveRequestId,
    status,
    reviewNote,
    reviewerId,
  }) {
    console.log('[Service] reviewLeave starting');

    const leaveRequest = await LeaveRequest.findOne({
      _id: leaveRequestId,
      schoolId,
    });

    if (!leaveRequest) {
      throw new AppError('Leave request not found', 404);
    }

    leaveRequest.status = status;
    leaveRequest.reviewNote = reviewNote || '';
    leaveRequest.reviewerId = reviewerId;

    await leaveRequest.save();

    return leaveRequest;
  }
}

export default new LeaveService();
