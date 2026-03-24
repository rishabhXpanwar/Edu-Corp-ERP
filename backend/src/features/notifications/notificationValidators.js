import { body } from 'express-validator';

export const sendNotificationSchema = [
  body('type')
    .trim()
    .isIn(['individual', 'section', 'class'])
    .withMessage('Invalid type'),

  body('message')
    .isString()
    .withMessage('Message required, max 1000 chars')
    .trim()
    .notEmpty()
    .withMessage('Message required, max 1000 chars')
    .isLength({ max: 1000 })
    .withMessage('Message required, max 1000 chars'),

  body('admissionNumber')
    .if(body('type').equals('individual'))
    .trim()
    .notEmpty()
    .withMessage('Admission number required for individual notifications'),

  body('recipientId')
    .if(body('type').equals('individual'))
    .optional()
    .isMongoId()
    .withMessage('Invalid recipientId'),

  body('sectionId')
    .if(body('type').equals('section'))
    .trim()
    .notEmpty()
    .withMessage('sectionId required for section notifications')
    .isMongoId()
    .withMessage('Invalid sectionId'),

  body('sectionId')
    .if(body('type').equals('class'))
    .optional()
    .isMongoId()
    .withMessage('Invalid sectionId'),

  body('classId')
    .if(body('type').isIn(['section', 'class']))
    .trim()
    .notEmpty()
    .withMessage('classId required for section/class notifications')
    .isMongoId()
    .withMessage('Invalid classId'),
];

export const markReadSchema = [
  body('notificationIds')
    .isArray({ min: 1 })
    .withMessage('notificationIds array required'),

  body('notificationIds.*')
    .isMongoId()
    .withMessage('Each ID must be a valid Mongo ID'),
];
