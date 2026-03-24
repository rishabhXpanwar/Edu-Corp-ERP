import { body, param, query } from 'express-validator';

export const updateProfileValidator = [
  body('name').optional().isString().trim()
    .withMessage('Name must be a string'),
  body('firstName').optional().isString().trim()
    .withMessage('First name must be a string'),
  body('lastName').optional().isString().trim()
    .withMessage('Last name must be a string'),
  body('phone').optional().isString().trim()
    .withMessage('Phone must be a string'),
];

export const updatePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required').isString(),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isString()
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
];

// ==================== TEACHER VALIDATORS ====================

export const createTeacherValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  body('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .isString()
    .withMessage('Phone must be a string')
    .trim(),
  body('password')
    .optional()
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('subjectsTaught')
    .optional()
    .isArray()
    .withMessage('Subjects taught must be an array'),
  body('subjectsTaught.*')
    .optional()
    .isString()
    .withMessage('Each subject must be a string')
    .trim(),
  body('designation')
    .optional()
    .isString()
    .withMessage('Designation must be a string')
    .trim(),
  body('joiningDate')
    .optional()
    .isISO8601()
    .withMessage('Joining date must be a valid date'),
  body('salary')
    .optional()
    .isNumeric()
    .withMessage('Salary must be a number'),
  body('avatarUrl')
    .optional()
    .isString()
    .withMessage('Avatar URL must be a string')
    .trim(),
];

// ==================== MANAGER VALIDATORS ====================

const MANAGER_ROLES = ['financeManager', 'hrManager', 'academicManager', 'adminManager'];

export const createManagerValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  body('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .isString()
    .withMessage('Phone must be a string')
    .trim(),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(MANAGER_ROLES)
    .withMessage(`Role must be one of: ${MANAGER_ROLES.join(', ')}`),
  body('password')
    .optional()
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('designation')
    .optional()
    .isString()
    .withMessage('Designation must be a string')
    .trim(),
  body('joiningDate')
    .optional()
    .isISO8601()
    .withMessage('Joining date must be a valid date'),
  body('salary')
    .optional()
    .isNumeric()
    .withMessage('Salary must be a number'),
  body('avatarUrl')
    .optional()
    .isString()
    .withMessage('Avatar URL must be a string')
    .trim(),
];

// ==================== STATUS VALIDATORS ====================

export const updateUserStatusValidator = [
  body('isActive')
    .notEmpty()
    .withMessage('isActive is required')
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const idParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];

export const listQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .trim(),
];
