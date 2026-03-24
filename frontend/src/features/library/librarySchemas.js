import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must not exceed 500 characters'),
  author: z.string().min(1, 'Author is required').max(200, 'Author must not exceed 200 characters'),
  isbn: z.string().max(20, 'ISBN must not exceed 20 characters').optional().or(z.literal('')),
  category: z.string().max(100, 'Category must not exceed 100 characters').optional().or(z.literal('')),
  totalCopies: z.coerce.number().int().min(1, 'Total copies must be at least 1'),
});

export const updateBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must not exceed 500 characters').optional(),
  author: z.string().min(1, 'Author is required').max(200, 'Author must not exceed 200 characters').optional(),
  isbn: z.string().max(20, 'ISBN must not exceed 20 characters').optional().or(z.literal('')),
  category: z.string().max(100, 'Category must not exceed 100 characters').optional().or(z.literal('')),
  totalCopies: z.coerce.number().int().min(1, 'Total copies must be at least 1').optional(),
});

export const issueBookSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  dueDate: z.string().min(1, 'Due date is required').refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    },
    { message: 'Due date must be a valid future date' }
  ),
});
