import { body } from 'express-validator';

export const createFeeValidator = [
  body('studentId')
    .isMongoId()
    .withMessage('Valid studentId is required'),
  body('classId')
    .isMongoId()
    .withMessage('Valid classId is required'),
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('amount')
    .isNumeric()
    .custom((value) => value > 0)
    .withMessage('Amount must be a number greater than 0'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid dueDate is required'),
];

export const statusUpdateValidator = [
  body('paymentMethod')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Payment method must be a valid string if provided'),
];
