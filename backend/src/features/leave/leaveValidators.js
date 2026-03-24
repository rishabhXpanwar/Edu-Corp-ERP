import { body, param } from 'express-validator';

const LEAVE_TYPES = ['sick', 'casual', 'maternity', 'other'];
const REVIEW_STATUSES = ['approved', 'rejected'];

export const applyLeaveValidator = [
  body('type')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Leave type is required')
    .isIn(LEAVE_TYPES)
    .withMessage('Leave type must be one of: sick, casual, maternity, other'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid startDate is required')
    .toDate(),
  body('endDate')
    .isISO8601()
    .withMessage('Valid endDate is required')
    .toDate()
    .custom((value, { req }) => {
      if (!req.body.startDate) {
        return true;
      }
      return new Date(value) >= new Date(req.body.startDate);
    })
    .withMessage('endDate must be on or after startDate'),
  body('reason')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Reason is required'),
  body('attachmentUrl')
    .optional()
    .isString()
    .trim()
    .isURL()
    .withMessage('attachmentUrl must be a valid URL'),
];

export const reviewLeaveValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid leave request id is required'),
  body('status')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(REVIEW_STATUSES)
    .withMessage('Status must be either approved or rejected'),
  body('reviewNote')
    .optional()
    .isString()
    .trim(),
];
