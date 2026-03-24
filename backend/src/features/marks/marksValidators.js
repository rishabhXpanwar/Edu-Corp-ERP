import { body, param } from 'express-validator';

export const saveMarksValidator = [
  body('examId')
    .notEmpty()
    .withMessage('Exam ID is required')
    .isMongoId()
    .withMessage('Exam ID must be a valid ObjectId'),
  body('sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
  body('marksData')
    .isArray({ min: 1 })
    .withMessage('Marks data must be a non-empty array'),
  body('marksData.*.studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Student ID must be a valid ObjectId'),
  body('marksData.*.subjects')
    .isArray({ min: 1 })
    .withMessage('Subjects must be a non-empty array'),
  body('marksData.*.subjects.*.subjectName')
    .notEmpty()
    .withMessage('Subject name is required')
    .isString()
    .withMessage('Subject name must be a string')
    .trim(),
  body('marksData.*.subjects.*.totalMarks')
    .notEmpty()
    .withMessage('Total marks is required')
    .isNumeric()
    .withMessage('Total marks must be numeric'),
  body('marksData.*.subjects.*.obtainedMarks')
    .notEmpty()
    .withMessage('Obtained marks is required')
    .isNumeric()
    .withMessage('Obtained marks must be numeric'),
  body('marksData.*.subjects.*.grade')
    .optional()
    .isString()
    .withMessage('Grade must be a string')
    .trim(),
  body('marksData.*.subjects.*.remarks')
    .optional()
    .isString()
    .withMessage('Remarks must be a string')
    .trim(),
];

export const publishValidator = [
  param('examId')
    .notEmpty()
    .withMessage('Exam ID is required')
    .isMongoId()
    .withMessage('Exam ID must be a valid ObjectId'),
  param('sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
];

export const getSectionMarksValidator = [
  param('examId')
    .notEmpty()
    .withMessage('Exam ID is required')
    .isMongoId()
    .withMessage('Exam ID must be a valid ObjectId'),
  param('sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Section ID must be a valid ObjectId'),
];

export const getStudentMarksValidator = [
  param('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Student ID must be a valid ObjectId'),
  param('examId')
    .notEmpty()
    .withMessage('Exam ID is required')
    .isMongoId()
    .withMessage('Exam ID must be a valid ObjectId'),
];
