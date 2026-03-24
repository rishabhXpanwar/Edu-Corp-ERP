import Announcement from '../../models/Announcement.js';
import asyncHandler from '../../utils/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import { getPagination } from '../../utils/paginationHelper.js';

const getAuthUserId = (user) => {
  if (!user) {
    return null;
  }

  return user._id || user.userId || user.id || null;
};

export const createAnnouncement = asyncHandler(async (req, res) => {
  console.log('[AnnouncementCtrl] createAnnouncement called');

  const authorId = getAuthUserId(req.user);
  if (!authorId) {
    throw new AppError('Unauthorized', 401);
  }

  const { title, body, audience } = req.body;

  const announcement = await Announcement.create({
    schoolId: req.schoolId,
    authorId,
    title,
    body,
    audience,
  });

  await announcement.populate('authorId', 'name role');

  res.status(201).json({
    success: true,
    message: 'Announcement posted',
    data: { announcement },
  });
});

export const getAnnouncements = asyncHandler(async (req, res) => {
  console.log('[AnnouncementCtrl] getAnnouncements called');

  const { page, limit, skip } = getPagination(req.query);

  const filter = {
    schoolId: req.schoolId,
  };

  if (req.query.audience) {
    filter.audience = req.query.audience;
  }

  const [items, total] = await Promise.all([
    Announcement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'name role'),
    Announcement.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Announcements fetched',
    data: {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getAnnouncementById = asyncHandler(async (req, res) => {
  console.log('[AnnouncementCtrl] getAnnouncementById called');

  const announcement = await Announcement.findOne({
    _id: req.params.id,
    schoolId: req.schoolId,
  }).populate('authorId', 'name role');

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Announcement fetched',
    data: { announcement },
  });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  console.log('[AnnouncementCtrl] deleteAnnouncement called');

  const requesterId = getAuthUserId(req.user);
  if (!requesterId) {
    throw new AppError('Unauthorized', 401);
  }

  const announcement = await Announcement.findOne({
    _id: req.params.id,
    schoolId: req.schoolId,
  });

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  const isPrincipal = req.user.role === 'principal';
  if (!isPrincipal && announcement.authorId.toString() !== requesterId.toString()) {
    throw new AppError('You can only delete your own announcements', 403);
  }

  await Announcement.deleteOne({ _id: announcement._id });

  res.status(200).json({
    success: true,
    message: 'Announcement deleted',
    data: {},
  });
});
