import { body } from 'express-validator';

export const createAnnouncementSchema = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title required, max 200 chars')
    .isLength({ max: 200 })
    .withMessage('Title required, max 200 chars'),

  body('body')
    .trim()
    .notEmpty()
    .withMessage('Body required, max 5000 chars')
    .isLength({ max: 5000 })
    .withMessage('Body required, max 5000 chars'),

  body('audience')
    .isIn(['all', 'staff', 'students'])
    .withMessage('audience must be all, staff, or students'),
];
