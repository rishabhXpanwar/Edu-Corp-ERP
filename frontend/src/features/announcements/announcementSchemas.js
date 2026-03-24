import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title required')
    .max(200, 'Max 200 chars'),
  body: z
    .string()
    .trim()
    .min(1, 'Body required')
    .max(5000, 'Max 5000 chars'),
  audience: z.enum(['all', 'staff', 'students'], {
    required_error: 'Audience required',
  }),
});
