import { body, param, query } from 'express-validator';

export const createStudentValidator = [
  // Student details
  body('student.name')
    .notEmpty()
    .withMessage('Student name is required')
    .isString()
    .withMessage('Student name must be a string')
    .trim(),
  body('student.email')
    .notEmpty()
    .withMessage('Student email is required')
    .isEmail()
    .withMessage('Student email must be valid')
    .normalizeEmail(),
  body('student.phone')
    .notEmpty()
    .withMessage('Student phone is required')
    .isString()
    .withMessage('Student phone must be a string')
    .trim(),
  body('student.password')
    .optional()
    .isString()
    .withMessage('Student password must be a string')
    .isLength({ min: 6 })
    .withMessage('Student password must be at least 6 characters'),
  body('student.admissionNumber')
    .notEmpty()
    .withMessage('Admission number is required')
    .isString()
    .withMessage('Admission number must be a string')
    .trim(),
  body('student.classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Class ID must be a valid ObjectId'),
  body('student.sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
  body('student.avatarUrl')
    .optional()
    .isString()
    .withMessage('Avatar URL must be a string')
    .trim(),

  // Parent details
  body('parent.name')
    .notEmpty()
    .withMessage('Parent name is required')
    .isString()
    .withMessage('Parent name must be a string')
    .trim(),
  body('parent.email')
    .notEmpty()
    .withMessage('Parent email is required')
    .isEmail()
    .withMessage('Parent email must be valid')
    .normalizeEmail(),
  body('parent.phone')
    .notEmpty()
    .withMessage('Parent phone is required')
    .isString()
    .withMessage('Parent phone must be a string')
    .trim(),
  body('parent.password')
    .optional()
    .isString()
    .withMessage('Parent password must be a string')
    .isLength({ min: 6 })
    .withMessage('Parent password must be at least 6 characters'),
  body('parent.avatarUrl')
    .optional()
    .isString()
    .withMessage('Parent avatar URL must be a string')
    .trim(),
];

export const updateStudentValidator = [
  // Optional student fields
  body('student.name')
    .optional()
    .isString()
    .withMessage('Student name must be a string')
    .trim(),
  body('student.email')
    .optional()
    .isEmail()
    .withMessage('Student email must be valid')
    .normalizeEmail(),
  body('student.phone')
    .optional()
    .isString()
    .withMessage('Student phone must be a string')
    .trim(),
  body('student.admissionNumber')
    .optional()
    .isString()
    .withMessage('Admission number must be a string')
    .trim(),
  body('student.classId')
    .optional()
    .isMongoId()
    .withMessage('Class ID must be a valid ObjectId'),
  body('student.sectionId')
    .optional()
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
  body('student.avatarUrl')
    .optional()
    .isString()
    .withMessage('Avatar URL must be a string')
    .trim(),

  // Optional parent fields
  body('parent.name')
    .optional()
    .isString()
    .withMessage('Parent name must be a string')
    .trim(),
  body('parent.email')
    .optional()
    .isEmail()
    .withMessage('Parent email must be valid')
    .normalizeEmail(),
  body('parent.phone')
    .optional()
    .isString()
    .withMessage('Parent phone must be a string')
    .trim(),
  body('parent.avatarUrl')
    .optional()
    .isString()
    .withMessage('Parent avatar URL must be a string')
    .trim(),
];

export const idParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid student ID format'),
];

export const listStudentsQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('classId')
    .optional()
    .isMongoId()
    .withMessage('Class ID must be a valid ObjectId'),
  query('sectionId')
    .optional()
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .trim(),
];
