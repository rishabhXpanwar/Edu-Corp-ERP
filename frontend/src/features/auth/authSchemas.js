import { z } from 'zod';

export const emailLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const otpRequestSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(15, 'Phone number is too long').regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format'),
});

export const otpLoginSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 characters').regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format'),
  otp: z.string().min(6, 'OTP must be 6 characters').max(6, 'OTP must be 6 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});
