import { z } from 'zod';

export const periodSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  startTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
});
