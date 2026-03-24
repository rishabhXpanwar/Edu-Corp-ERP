import { z } from 'zod';

export const createEventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title required')
    .max(200, 'Max 200 chars'),
  type: z.enum(['holiday', 'exam', 'event'], {
    required_error: 'Type required',
  }),
  startDate: z
    .string()
    .min(1, 'Start date required'),
  endDate: z
    .string()
    .min(1, 'End date required'),
  description: z
    .string()
    .trim()
    .max(1000, 'Max 1000 chars')
    .optional()
    .or(z.literal('')),
}).superRefine((value, ctx) => {
  if (!value.startDate || !value.endDate) {
    return;
  }

  const startDate = new Date(value.startDate);
  const endDate = new Date(value.endDate);

  if (endDate < startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'End date must be on or after start date',
    });
  }
});
