import { body, param } from 'express-validator';

export const createAssignmentValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim(),
  body('description')
    .optional()
    .trim(),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .trim(),
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Invalid Class ID'),
  body('sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Invalid Section ID'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  body('attachments.*.name')
    .optional()
    .notEmpty()
    .withMessage('Attachment name is required'),
  body('attachments.*.url')
    .optional()
    .notEmpty()
    .withMessage('Attachment URL is required'),
  body('attachments.*.type')
    .optional()
    .notEmpty()
    .withMessage('Attachment type is required'),
];

export const paramsValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid assignment ID'),
];

export const sectionParamsValidator = [
  param('sectionId')
    .isMongoId()
    .withMessage('Invalid section ID'),
];
