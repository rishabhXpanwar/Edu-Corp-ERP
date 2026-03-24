import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Valid school email is required'),
  principalName: z.string().min(1, 'Principal name is required'),
  principalEmail: z.string().email('Valid principal email is required'),
  principalPhone: z.string().min(1, 'Principal phone is required'),
  plan: z.enum(['basic', 'standard', 'premium'])
});