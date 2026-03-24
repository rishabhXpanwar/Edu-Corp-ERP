import { body } from 'express-validator';

export const loginEmailSchema = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

export const sendOtpSchema = [
  body('phone')
    .isString()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Valid phone number is required (E.164 format)'),
];

export const loginOtpSchema = [
  body('phone')
    .isString()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Valid phone number is required'),
  body('otp').isString().isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
];

export const forgotPasswordSchema = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const resetPasswordSchema = [
  body('token').isString().notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];
