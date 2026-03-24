import { body, param } from 'express-validator';

export const updatePlanSchema = [
  body('plan')
    .trim()
    .isIn(['basic', 'standard', 'premium'])
    .withMessage('Plan must be basic, standard, or premium'),
];

export const recordPaymentSchema = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a numeric value'),
  body('method')
    .trim()
    .isIn(['card', 'bank_transfer', 'cash'])
    .withMessage('Method must be card, bank_transfer, or cash'),
  body('receiptUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('receiptUrl must be a valid URL'),
];

export const subscriptionIdParamSchema = [
  param('id')
    .isMongoId()
    .withMessage('Invalid subscription ID format'),
];
