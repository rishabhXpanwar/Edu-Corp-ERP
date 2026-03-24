import { body, param } from 'express-validator';

export const createTransportValidator = [
  body('routeName')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Route name is required')
    .isLength({ max: 200 })
    .withMessage('Route name must not exceed 200 characters'),
  body('vehicleNumber')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Vehicle number is required')
    .isLength({ max: 50 })
    .withMessage('Vehicle number must not exceed 50 characters'),
  body('driverName')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Driver name is required')
    .isLength({ max: 100 })
    .withMessage('Driver name must not exceed 100 characters'),
  body('driverPhone')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Driver phone is required')
    .isLength({ max: 20 })
    .withMessage('Driver phone must not exceed 20 characters'),
  body('stops')
    .optional()
    .isArray()
    .withMessage('Stops must be an array'),
  body('stops.*.stopName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Stop name is required for each stop'),
  body('stops.*.pickUpTime')
    .optional()
    .isString()
    .trim(),
  body('stops.*.dropTime')
    .optional()
    .isString()
    .trim(),
  body('stops.*.feeAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fee amount must be a positive number')
    .toFloat(),
];

export const updateTransportValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid transport id is required'),
  body('routeName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Route name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Route name must not exceed 200 characters'),
  body('vehicleNumber')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Vehicle number cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Vehicle number must not exceed 50 characters'),
  body('driverName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Driver name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Driver name must not exceed 100 characters'),
  body('driverPhone')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Driver phone cannot be empty')
    .isLength({ max: 20 })
    .withMessage('Driver phone must not exceed 20 characters'),
  body('stops')
    .optional()
    .isArray()
    .withMessage('Stops must be an array'),
  body('stops.*.stopName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Stop name is required for each stop'),
  body('stops.*.pickUpTime')
    .optional()
    .isString()
    .trim(),
  body('stops.*.dropTime')
    .optional()
    .isString()
    .trim(),
  body('stops.*.feeAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fee amount must be a positive number')
    .toFloat(),
];

export const getTransportValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid transport id is required'),
];

export const deleteTransportValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid transport id is required'),
];

export const assignStudentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid transport id is required'),
  body('studentId')
    .isMongoId()
    .withMessage('Valid studentId is required'),
];

export const unassignStudentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid transport id is required'),
  body('studentId')
    .isMongoId()
    .withMessage('Valid studentId is required'),
];
