import { body } from 'express-validator';

export const createSalaryValidator = [
  body('teacherId')
    .isMongoId()
    .withMessage('Valid teacherId is required'),
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be an integer between 1 and 12')
    .toInt(),
  body('year')
    .isInt({ min: 1900 })
    .withMessage('Year must be a valid integer')
    .toInt(),
  body('baseSalary')
    .isFloat({ min: 0 })
    .withMessage('Base salary must be a number greater than or equal to 0')
    .toFloat(),
  body('deductions')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deductions must be a number greater than or equal to 0')
    .toFloat(),
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a number greater than or equal to 0')
    .toFloat(),
];

export const statusUpdateValidator = [
  body('paymentMethod')
    .optional()
    .isString()
    .withMessage('Payment method must be a valid string if provided')
    .trim()
    .notEmpty()
    .withMessage('Payment method cannot be empty'),
];
