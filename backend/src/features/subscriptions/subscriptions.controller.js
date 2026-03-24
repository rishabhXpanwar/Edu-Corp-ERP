import Subscription from '../../models/Subscription.js';
import School from '../../models/School.js';
import asyncHandler from '../../utils/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import { getPagination } from '../../utils/paginationHelper.js';

export const getSubscriptions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = {};

  if (req.query.status) {
    query.status = req.query.status;
  }

  const items = await Subscription.find(query)
    .populate('schoolId', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Subscription.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      items, total, page, limit, totalPages,
    },
  });
});

export const getSubscriptionById = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id)
    .populate('schoolId', 'name email phone');

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  res.status(200).json({
    success: true,
    data: subscription,
  });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  subscription.plan = plan;
  await subscription.save();

  await School.findByIdAndUpdate(subscription.schoolId, { plan });

  res.status(200).json({
    success: true,
    message: 'Subscription plan updated successfully',
    data: subscription,
  });
});

export const recordBilling = asyncHandler(async (req, res) => {
  const { amount, method, receiptUrl } = req.body;
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  const paymentRecord = {
    amount,
    method,
    receiptUrl: receiptUrl || '',
    paidAt: new Date(),
  };

  subscription.billing.push(paymentRecord);
  await subscription.save();

  res.status(200).json({
    success: true,
    message: 'Payment recorded successfully',
    data: subscription,
  });
});
