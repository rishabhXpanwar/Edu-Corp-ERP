import LibraryBook from '../models/LibraryBook.js';
import AppError from '../utils/AppError.js';

class LibraryService {
  /**
   * Create a new book
   */
  async createBook({ schoolId, title, author, isbn, category, totalCopies }) {
    console.log('[Service] createBook starting');

    const book = await LibraryBook.create({
      schoolId,
      title,
      author,
      isbn: isbn || undefined,
      category: category || undefined,
      totalCopies,
      availableCopies: totalCopies,
    });

    console.log('[Service] createBook completed — bookId:', book._id);
    return book;
  }

  /**
   * Get all books with pagination, search, and category filter
   */
  async getBooks(schoolId, { search, category, page = 1, limit = 20 } = {}) {
    console.log('[Service] getBooks starting');

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    const query = { schoolId };

    // Search filter: search by title or author
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
      ];
    }

    // Category filter
    if (category && category.trim()) {
      query.category = new RegExp(category.trim(), 'i');
    }

    const [items, total] = await Promise.all([
      LibraryBook.find(query)
        .select('-issues')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      LibraryBook.countDocuments(query),
    ]);

    console.log('[Service] getBooks completed — found:', items.length);
    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  /**
   * Get a single book by id
   */
  async getBook(schoolId, bookId) {
    console.log('[Service] getBook starting — bookId:', bookId);

    const book = await LibraryBook.findOne({
      _id: bookId,
      schoolId,
    })
      .populate('issues.userId', 'name email role')
      .lean();

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    console.log('[Service] getBook completed');
    return book;
  }

  /**
   * Update a book
   */
  async updateBook(schoolId, bookId, updates) {
    console.log('[Service] updateBook starting — bookId:', bookId);

    const book = await LibraryBook.findOne({
      _id: bookId,
      schoolId,
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Allowed fields to update
    const allowedFields = ['title', 'author', 'isbn', 'category', 'totalCopies'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        book[field] = updates[field];
      }
    }

    // Recalculate availableCopies if totalCopies changed
    if (updates.totalCopies !== undefined) {
      const issuedCount = book.issues.filter(
        (issue) => issue.status === 'issued'
      ).length;
      book.availableCopies = Math.max(0, updates.totalCopies - issuedCount);
    }

    await book.save();

    console.log('[Service] updateBook completed');
    return book;
  }

  /**
   * Delete a book
   */
  async deleteBook(schoolId, bookId) {
    console.log('[Service] deleteBook starting — bookId:', bookId);

    const book = await LibraryBook.findOneAndDelete({
      _id: bookId,
      schoolId,
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    console.log('[Service] deleteBook completed');
    return book;
  }

  /**
   * Issue a book to a user
   */
  async issueBook(schoolId, bookId, { userId, dueDate }) {
    console.log('[Service] issueBook starting — bookId:', bookId, 'userId:', userId);

    const book = await LibraryBook.findOne({
      _id: bookId,
      schoolId,
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (book.availableCopies <= 0) {
      throw new AppError('No copies available for issue', 400);
    }

    // Check if user already has this book issued
    const existingIssue = book.issues.find(
      (issue) =>
        issue.userId.toString() === userId.toString() &&
        issue.status === 'issued'
    );

    if (existingIssue) {
      throw new AppError('User already has this book issued', 400);
    }

    // Add issue record
    book.issues.push({
      userId,
      issueDate: new Date(),
      dueDate: new Date(dueDate),
      status: 'issued',
    });

    // Decrement available copies
    book.availableCopies -= 1;

    await book.save();

    // Populate user info before returning
    await book.populate('issues.userId', 'name email role');

    console.log('[Service] issueBook completed');
    return book;
  }

  /**
   * Return a book from a user
   */
  async returnBook(schoolId, bookId, userId) {
    console.log('[Service] returnBook starting — bookId:', bookId, 'userId:', userId);

    const book = await LibraryBook.findOne({
      _id: bookId,
      schoolId,
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Find the issue record for this user
    const issueIndex = book.issues.findIndex(
      (issue) =>
        issue.userId.toString() === userId.toString() &&
        issue.status === 'issued'
    );

    if (issueIndex === -1) {
      throw new AppError('No active issue found for this user', 400);
    }

    // Update issue record
    book.issues[issueIndex].status = 'returned';
    book.issues[issueIndex].returnDate = new Date();

    // Increment available copies
    book.availableCopies += 1;

    await book.save();

    // Populate user info before returning
    await book.populate('issues.userId', 'name email role');

    console.log('[Service] returnBook completed');
    return book;
  }
}

export default new LibraryService();
