import { body, param } from 'express-validator';

export const createSchoolSchema = [
  body('name').trim().notEmpty().withMessage('School name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').trim().isEmail().withMessage('Valid school email is required'),
  body('principalName').trim().notEmpty().withMessage('Principal name is required'),
  body('principalEmail').trim().isEmail().withMessage('Valid principal email is required'),
  body('principalPhone').trim().notEmpty().withMessage('Principal phone is required'),
  body('plan').isIn(['basic', 'standard', 'premium']).withMessage('Plan must be basic, standard, or premium'),
];

export const schoolIdParamSchema = [
  param('id').isMongoId().withMessage('Invalid school ID format'),
];
