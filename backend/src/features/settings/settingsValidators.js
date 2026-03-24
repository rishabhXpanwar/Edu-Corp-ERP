import { body } from 'express-validator';

const PHONE_REGEX = /^\+?[0-9\s-]{7,15}$/;

export const settingsUpdateValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('address')
    .optional()
    .trim()
    .isString()
    .withMessage('Address must be a string'),
  body('phone')
    .optional()
    .trim()
    .matches(PHONE_REGEX)
    .withMessage('Phone must be a valid phone number'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
];
