import { z } from 'zod';

const phoneRegex = /^[0-9+\-\s()]+$/;

export const admissionSchema = z.object({
  student: z.object({
    name: z.string().min(1, 'Student name is required'),
    email: z.string().email('Valid email is required').min(1, 'Student email is required'),
    phone: z.string().regex(phoneRegex, 'Valid phone is required').min(1, 'Student phone is required'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    admissionNumber: z.string().min(1, 'Admission number is required'),
    classId: z.string().min(1, 'Class is required'),
    sectionId: z.string().min(1, 'Section is required'),
    avatarUrl: z.string().optional()
  }),
  parent: z.object({
    name: z.string().min(1, 'Parent name is required'),
    email: z.string().email('Valid email is required').min(1, 'Parent email is required'),
    phone: z.string().regex(phoneRegex, 'Valid phone is required').min(1, 'Parent phone is required'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    avatarUrl: z.string().optional()
  })
});

export const updateStudentSchema = z.object({
  student: z.object({
    name: z.string().min(1, 'Student name is required').optional(),
    email: z.string().email('Valid email is required').optional(),
    phone: z.string().regex(phoneRegex, 'Valid phone is required').optional(),
    admissionNumber: z.string().min(1, 'Admission number is required').optional(),
    classId: z.string().min(1, 'Class is required').optional(),
    sectionId: z.string().min(1, 'Section is required').optional(),
    avatarUrl: z.string().optional()
  }),
  parent: z.object({
    name: z.string().min(1, 'Parent name is required').optional(),
    email: z.string().email('Valid email is required').optional(),
    phone: z.string().regex(phoneRegex, 'Valid phone is required').optional(),
    avatarUrl: z.string().optional()
  })
});
