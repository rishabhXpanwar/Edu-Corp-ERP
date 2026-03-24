import mongoose from 'mongoose';
import AuditLog from '../../models/AuditLog.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { getPagination } from '../../utils/paginationHelper.js';

const parseDateOrThrow = (value, fieldName) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
  return parsed;
};

export const getAuditLogs = asyncHandler(async (req, res) => {
  console.log('[AuditCtrl] getAuditLogs called');

  const {
    actorId,
    action,
    targetModel,
    startDate,
    endDate,
  } = req.query;

  const filter = { schoolId: req.schoolId };

  if (actorId) {
    if (!mongoose.isValidObjectId(actorId)) {
      throw new AppError('Invalid actorId', 400);
    }
    filter.actorId = actorId;
  }

  if (action) {
    filter.action = { $regex: action, $options: 'i' };
  }

  if (targetModel) {
    filter.targetModel = targetModel;
  }

  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.$gte = parseDateOrThrow(startDate, 'startDate');
    }

    if (endDate) {
      filter.createdAt.$lte = parseDateOrThrow(`${endDate}T23:59:59`, 'endDate');
    }
  }

  const { page, limit, skip } = getPagination(req.query);

  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('actorId', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  res.status(200).json({
    success: true,
    message: 'Audit logs fetched',
    data: {
      items,
      total,
      page,
      limit,
      totalPages,
    },
  });
});
