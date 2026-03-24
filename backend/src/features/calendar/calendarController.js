import CalendarEvent from '../../models/CalendarEvent.js';
import asyncHandler from '../../utils/asyncHandler.js';
import AppError from '../../utils/AppError.js';

const resolveUserId = (user) => {
  if (!user) {
    return null;
  }

  return user._id || user.userId || user.id || null;
};

export const createEvent = asyncHandler(async (req, res) => {
  console.log('[CalendarCtrl] createEvent called');

  const {
    title,
    description = '',
    type,
    startDate,
    endDate,
    color = null,
  } = req.body;
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  if (parsedEndDate < parsedStartDate) {
    throw new AppError('endDate must be >= startDate', 400);
  }

  const createdBy = resolveUserId(req.user);
  if (!createdBy) {
    throw new AppError('Unauthorized', 401);
  }

  const event = await CalendarEvent.create({
    schoolId: req.schoolId,
    createdBy,
    title,
    description,
    type,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    color,
  });

  res.status(201).json({
    success: true,
    message: 'Event created',
    data: { event },
  });
});

export const getEvents = asyncHandler(async (req, res) => {
  console.log('[CalendarCtrl] getEvents called');

  const now = new Date();
  const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
  const year = parseInt(req.query.year, 10) || now.getFullYear();

  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const events = await CalendarEvent.find({
    schoolId: req.schoolId,
    startDate: { $lte: end },
    endDate: { $gte: start },
  }).sort({ startDate: 1 });

  res.status(200).json({
    success: true,
    message: 'Events fetched',
    data: { events },
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  console.log('[CalendarCtrl] updateEvent called');

  const event = await CalendarEvent.findOne({
    _id: req.params.id,
    schoolId: req.schoolId,
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const nextStartDate = req.body.startDate ? new Date(req.body.startDate) : event.startDate;
  const nextEndDate = req.body.endDate ? new Date(req.body.endDate) : event.endDate;

  if (nextEndDate < nextStartDate) {
    throw new AppError('endDate must be >= startDate', 400);
  }

  Object.assign(event, req.body);
  await event.save();

  res.status(200).json({
    success: true,
    message: 'Event updated',
    data: { event },
  });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  console.log('[CalendarCtrl] deleteEvent called');

  const event = await CalendarEvent.findOne({
    _id: req.params.id,
    schoolId: req.schoolId,
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await CalendarEvent.deleteOne({ _id: event._id });

  res.status(200).json({
    success: true,
    message: 'Event deleted',
    data: {},
  });
});
