import libraryService from '../../services/libraryService.js';
import { auditWriter } from '../../utils/auditWriter.js';

export const createBook = async (req, res, next) => {
  console.log('[CTRL] createBook called');

  try {
    const { title, author, isbn, category, totalCopies } = req.body;

    const book = await libraryService.createBook({
      schoolId: req.schoolId,
      title,
      author,
      isbn,
      category,
      totalCopies,
    });

    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'CREATE_BOOK',
      targetModel: 'LibraryBook',
      targetId: book._id,
      metadata: { title, author },
    });

    res.status(201).json({
      success: true,
      message: 'Book added',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

export const getBooks = async (req, res, next) => {
  console.log('[CTRL] getBooks called');

  try {
    const { search, category, page = '1', limit = '20' } = req.query;

    const result = await libraryService.getBooks(req.schoolId, {
      search,
      category,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      message: 'Books retrieved',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBook = async (req, res, next) => {
  console.log('[CTRL] getBook called');

  try {
    const { id } = req.params;

    const book = await libraryService.getBook(req.schoolId, id);

    res.status(200).json({
      success: true,
      message: 'Book retrieved',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  console.log('[CTRL] updateBook called');

  try {
    const { id } = req.params;
    const updates = req.body;

    const book = await libraryService.updateBook(req.schoolId, id, updates);

    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'UPDATE_BOOK',
      targetModel: 'LibraryBook',
      targetId: book._id,
      metadata: { updatedFields: Object.keys(updates) },
    });

    res.status(200).json({
      success: true,
      message: 'Book updated',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  console.log('[CTRL] deleteBook called');

  try {
    const { id } = req.params;

    const book = await libraryService.deleteBook(req.schoolId, id);

    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'DELETE_BOOK',
      targetModel: 'LibraryBook',
      targetId: id,
      metadata: { title: book.title, author: book.author },
    });

    res.status(200).json({
      success: true,
      message: 'Book deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const issueBook = async (req, res, next) => {
  console.log('[CTRL] issueBook called');

  try {
    const { id } = req.params;
    const { userId, dueDate } = req.body;

    const book = await libraryService.issueBook(req.schoolId, id, {
      userId,
      dueDate,
    });

    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'ISSUE_BOOK',
      targetModel: 'LibraryBook',
      targetId: book._id,
      metadata: { userId, dueDate },
    });

    res.status(200).json({
      success: true,
      message: 'Book issued',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (req, res, next) => {
  console.log('[CTRL] returnBook called');

  try {
    const { id } = req.params;
    const { userId } = req.body;

    const book = await libraryService.returnBook(req.schoolId, id, userId);

    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'RETURN_BOOK',
      targetModel: 'LibraryBook',
      targetId: book._id,
      metadata: { userId },
    });

    res.status(200).json({
      success: true,
      message: 'Book returned',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};
