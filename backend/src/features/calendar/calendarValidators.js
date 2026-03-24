import { body } from 'express-validator';

export const createEventSchema = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title required, max 200 chars')
    .isLength({ max: 200 })
    .withMessage('Title required, max 200 chars'),

  body('type')
    .isIn(['holiday', 'exam', 'event'])
    .withMessage('type must be holiday, exam, or event'),

  body('startDate')
    .isISO8601()
    .withMessage('Valid startDate required'),

  body('endDate')
    .isISO8601()
    .withMessage('Valid endDate required'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('description must be at most 1000 chars'),
];

export const updateEventSchema = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title required, max 200 chars')
    .isLength({ max: 200 })
    .withMessage('Title required, max 200 chars'),

  body('type')
    .optional()
    .isIn(['holiday', 'exam', 'event'])
    .withMessage('type must be holiday, exam, or event'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid startDate required'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid endDate required'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('description must be at most 1000 chars'),
];
