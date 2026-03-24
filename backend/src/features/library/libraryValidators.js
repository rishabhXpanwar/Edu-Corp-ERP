import { body, param } from 'express-validator';

export const createBookValidator = [
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 500 })
    .withMessage('Title must not exceed 500 characters'),
  body('author')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ max: 200 })
    .withMessage('Author must not exceed 200 characters'),
  body('isbn')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('ISBN must not exceed 20 characters'),
  body('category')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
  body('totalCopies')
    .isInt({ min: 1 })
    .withMessage('Total copies must be at least 1')
    .toInt(),
];

export const updateBookValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid book id is required'),
  body('title')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Title must not exceed 500 characters'),
  body('author')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Author cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Author must not exceed 200 characters'),
  body('isbn')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('ISBN must not exceed 20 characters'),
  body('category')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
  body('totalCopies')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total copies must be at least 1')
    .toInt(),
];

export const issueBookValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid book id is required'),
  body('userId')
    .isMongoId()
    .withMessage('Valid userId is required'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid dueDate is required')
    .toDate()
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('dueDate must be in the future');
      }
      return true;
    }),
];

export const returnBookValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid book id is required'),
  body('userId')
    .isMongoId()
    .withMessage('Valid userId is required'),
];

export const getBookValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid book id is required'),
];

export const deleteBookValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid book id is required'),
];
