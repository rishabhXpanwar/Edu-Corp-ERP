import { body, param } from 'express-validator';

export const createAcademicYearValidator = [
  body('name')
    .notEmpty()
    .withMessage('Academic year name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim(),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date'),
];

export const createClassValidator = [
  body('name')
    .notEmpty()
    .withMessage('Class name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim(),
  body('level')
    .notEmpty()
    .withMessage('Level is required')
    .isInt({ min: 1 })
    .withMessage('Level must be a positive integer'),
  body('academicYearId')
    .notEmpty()
    .withMessage('Academic year ID is required')
    .isMongoId()
    .withMessage('Academic year ID must be a valid ObjectId'),
];

export const updateClassValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim(),
  body('level')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Level must be a positive integer'),
];

export const createSectionValidator = [
  body('name')
    .notEmpty()
    .withMessage('Section name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim(),
  body('classTeacherId')
    .optional()
    .isMongoId()
    .withMessage('Class teacher ID must be a valid ObjectId'),
];

export const updateSectionValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim(),
  body('classTeacherId')
    .optional()
    .isMongoId()
    .withMessage('Class teacher ID must be a valid ObjectId'),
];

export const idParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

export const sectionIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid class ID format'),
  param('secId')
    .isMongoId()
    .withMessage('Invalid section ID format'),
];
