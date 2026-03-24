import Notification from '../../models/Notification.js';
import notificationService from '../../services/notificationService.js';
import asyncHandler from '../../utils/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import { getPagination } from '../../utils/paginationHelper.js';

const SENDER_ROLES = ['teacher', 'principal', 'academicManager', 'adminManager', 'hrManager', 'financeManager'];

const getAuthUserId = (user) => {
  if (!user) {
    return null;
  }

  return user._id || user.userId || user.id || null;
};

export const sendNotification = asyncHandler(async (req, res) => {
  console.log('[NotificationCtrl] sendNotification called');

  const senderId = getAuthUserId(req.user);
  if (!senderId) {
    throw new AppError('Unauthorized', 401);
  }

  const notification = await notificationService.send({
    senderId,
    schoolId: req.schoolId,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    message: 'Notification sent',
    data: { notification },
  });
});

export const getNotifications = asyncHandler(async (req, res) => {
  console.log('[NotificationCtrl] getNotifications called');

  const userId = getAuthUserId(req.user);
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { page, limit, skip } = getPagination(req.query);

  const filter = { schoolId: req.schoolId };
  if (req.query.type) {
    filter.type = req.query.type;
  }

  if (SENDER_ROLES.includes(req.user.role)) {
    filter.senderId = userId;
  } else {
    filter.recipientId = userId;
  }

  const [items, total] = await Promise.all([
    Notification.find(filter)
      .populate('senderId', 'name role')
      .populate('recipientId', 'name role admissionNumber')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    message: 'Notifications fetched',
    data: {
      items,
      total,
      page,
      limit,
      totalPages,
    },
  });
});

export const markRead = asyncHandler(async (req, res) => {
  console.log('[NotificationCtrl] markRead called');

  const userId = getAuthUserId(req.user);
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { notificationIds } = req.body;

  const result = await Notification.updateMany(
    {
      _id: { $in: notificationIds },
      recipientId: userId,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );

  res.status(200).json({
    success: true,
    message: 'Notifications marked as read',
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  console.log('[NotificationCtrl] getUnreadCount called');

  const userId = getAuthUserId(req.user);
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const unreadCount = await Notification.countDocuments({
    recipientId: userId,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    message: 'Unread count fetched',
    data: { unreadCount },
  });
});
