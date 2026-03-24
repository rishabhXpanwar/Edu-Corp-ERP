import { body, param, query } from 'express-validator';

export const markAttendanceValidator = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Class ID must be a valid ObjectId'),
  body('records')
    .isArray({ min: 1 })
    .withMessage('Records must be a non-empty array'),
  body('records.*.studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Student ID must be a valid ObjectId'),
  body('records.*.status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Present', 'Absent', 'Late', 'HalfDay'])
    .withMessage('Status must be one of: Present, Absent, Late, HalfDay'),
  body('records.*.remarks')
    .optional()
    .isString()
    .withMessage('Remarks must be a string')
    .trim(),
];

export const sectionIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid section ID format'),
];

export const studentIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid student ID format'),
];

export const sectionAttendanceQueryValidator = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),
];

export const studentAttendanceQueryValidator = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),
];

export const reportQueryValidator = [
  query('sectionId')
    .optional()
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
  query('classId')
    .optional()
    .isMongoId()
    .withMessage('Class ID must be a valid ObjectId'),
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),
];
