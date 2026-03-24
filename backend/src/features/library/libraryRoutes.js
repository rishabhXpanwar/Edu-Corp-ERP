import express from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { validate } from '../../middleware/validate.js';
import { scopeToSchool } from '../../middleware/scopeToSchool.js';
import { LIGHT, MODERATE } from '../../middleware/rateLimiter.js';
import { suspensionCheck } from '../../middleware/suspensionCheck.js';
import {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
} from './libraryController.js';
import {
  createBookValidator,
  updateBookValidator,
  issueBookValidator,
  returnBookValidator,
  getBookValidator,
  deleteBookValidator,
} from './libraryValidators.js';

const router = express.Router();

// POST / — Create a new book
router.post(
  '/',
  MODERATE,
  authenticate,
  authorize('principal', 'academicManager', 'adminManager'),
  validate(createBookValidator),
  scopeToSchool,
  createBook,
);

// GET / — Get all books with pagination, search, category filter
router.get(
  '/',
  LIGHT,
  authenticate,
  scopeToSchool,
  getBooks,
);

// GET /:id — Get a single book
router.get(
  '/:id',
  LIGHT,
  authenticate,
  validate(getBookValidator),
  scopeToSchool,
  getBook,
);

// PUT /:id — Update a book
router.put(
  '/:id',
  MODERATE,
  authenticate,
  authorize('principal', 'academicManager', 'adminManager'),
  validate(updateBookValidator),
  scopeToSchool,
  updateBook,
);

// DELETE /:id — Delete a book
router.delete(
  '/:id',
  MODERATE,
  authenticate,
  authorize('principal', 'academicManager', 'adminManager'),
  validate(deleteBookValidator),
  scopeToSchool,
  deleteBook,
);

// POST /:id/issue — Issue a book to a user
router.post(
  '/:id/issue',
  MODERATE,
  authenticate,
  authorize('principal', 'academicManager', 'adminManager', 'teacher'),
  validate(issueBookValidator),
  scopeToSchool,
  suspensionCheck,
  issueBook,
);

// POST /:id/return — Return a book from a user
router.post(
  '/:id/return',
  MODERATE,
  authenticate,
  authorize('principal', 'academicManager', 'adminManager', 'teacher'),
  validate(returnBookValidator),
  scopeToSchool,
  suspensionCheck,
  returnBook,
);

export default router;
