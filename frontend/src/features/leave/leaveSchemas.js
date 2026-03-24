import { z } from 'zod';

const todayString = new Date().toISOString().split('T')[0];

export const applyLeaveSchema = z
  .object({
    type: z.enum(['sick', 'casual', 'maternity', 'other'], {
      errorMap: () => ({ message: 'Leave type is required' }),
    }),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z
      .string()
      .trim()
      .min(10, 'Reason must be at least 10 characters')
      .max(500, 'Reason cannot exceed 500 characters'),
    attachmentUrl: z
      .string()
      .trim()
      .url('Attachment URL must be valid')
      .or(z.literal(''))
      .optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be the same or after start date',
    path: ['endDate'],
  })
  .refine((data) => data.startDate >= todayString, {
    message: 'Start date cannot be in the past',
    path: ['startDate'],
  });

export const reviewLeaveSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Status is required' }),
  }),
  reviewNote: z
    .string()
    .trim()
    .max(300, 'Review note cannot exceed 300 characters')
    .optional(),
});
