import { z } from 'zod';

export const sendNotificationSchema = z
  .object({
    type: z.enum(['individual', 'class'], {
      required_error: 'Select a type',
    }),
    message: z
      .string()
      .trim()
      .min(1, 'Message is required')
      .max(1000, 'Max 1000 characters'),
    admissionNumber: z.string().trim().optional(),
    classId: z.string().trim().optional(),
    sectionId: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'individual' && !data.admissionNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['admissionNumber'],
        message: 'Student admission number is required',
      });
    }

    if (data.type === 'class' && !data.classId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['classId'],
        message: 'Please select a class',
      });
    }
  });
