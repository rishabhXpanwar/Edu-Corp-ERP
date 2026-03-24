import { body, param } from 'express-validator';

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const validateUpdateTimetable = [
  param('sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
  body('schedule')
    .isArray()
    .withMessage('Schedule must be an array'),
  body('schedule.*.day')
    .notEmpty()
    .withMessage('Day is required')
    .isIn(VALID_DAYS)
    .withMessage(`Day must be one of: ${VALID_DAYS.join(', ')}`),
  body('schedule.*.periods')
    .isArray()
    .withMessage('Periods must be an array'),
  body('schedule.*.periods.*.subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isString()
    .withMessage('Subject must be a string')
    .trim(),
  body('schedule.*.periods.*.teacherId')
    .notEmpty()
    .withMessage('Teacher ID is required')
    .isMongoId()
    .withMessage('Teacher ID must be a valid ObjectId'),
  body('schedule.*.periods.*.startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(TIME_REGEX)
    .withMessage('Start time must be in HH:mm format (e.g., 09:00)'),
  body('schedule.*.periods.*.endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(TIME_REGEX)
    .withMessage('End time must be in HH:mm format (e.g., 10:00)'),
  body('schedule.*.periods.*.periodNumber')
    .optional()
    .isInt({ min: 0, max: 11 })
    .withMessage('Period number must be an integer between 0 and 11'),
];

export const validateGetTimetable = [
  param('sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
];
