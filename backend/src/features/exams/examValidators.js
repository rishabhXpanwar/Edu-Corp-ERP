import { body, param, query } from 'express-validator';

export const createExamValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .trim(),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('classes')
    .isArray({ min: 1 })
    .withMessage('Classes must be a non-empty array'),
  body('classes.*')
    .isMongoId()
    .withMessage('Each class ID must be a valid ObjectId'),
  body('dateSheet')
    .isArray({ min: 1 })
    .withMessage('Date sheet must be a non-empty array'),
  body('dateSheet.*.classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Class ID must be a valid ObjectId'),
  body('dateSheet.*.sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
  body('dateSheet.*.subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isString()
    .withMessage('Subject must be a string')
    .trim(),
  body('dateSheet.*.date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('dateSheet.*.startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isString()
    .withMessage('Start time must be a string')
    .trim(),
  body('dateSheet.*.endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isString()
    .withMessage('End time must be a string')
    .trim(),
];

export const updateExamValidator = [
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .trim(),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('classes')
    .optional()
    .isArray()
    .withMessage('Classes must be an array'),
  body('classes.*')
    .optional()
    .isMongoId()
    .withMessage('Each class ID must be a valid ObjectId'),
  body('dateSheet')
    .optional()
    .isArray()
    .withMessage('Date sheet must be an array'),
  body('dateSheet.*.classId')
    .optional()
    .isMongoId()
    .withMessage('Class ID must be a valid ObjectId'),
  body('dateSheet.*.sectionId')
    .optional()
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
  body('dateSheet.*.subject')
    .optional()
    .isString()
    .withMessage('Subject must be a string')
    .trim(),
  body('dateSheet.*.date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('dateSheet.*.startTime')
    .optional()
    .isString()
    .withMessage('Start time must be a string')
    .trim(),
  body('dateSheet.*.endTime')
    .optional()
    .isString()
    .withMessage('End time must be a string')
    .trim(),
];

export const examIdParamValidator = [
  param('examId')
    .notEmpty()
    .withMessage('Exam ID is required')
    .isMongoId()
    .withMessage('Exam ID must be a valid ObjectId'),
];

export const getExamsQueryValidator = [
  query('status')
    .optional()
    .isIn(['upcoming', 'ongoing', 'completed'])
    .withMessage('Status must be one of: upcoming, ongoing, completed'),
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),
];
