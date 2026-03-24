import asyncHandler from '../../utils/asyncHandler.js';
import * as authService from '../../services/authService.js';
import * as otpService from '../../services/otpService.js';
import * as smsService from '../../services/smsService.js';
import AppError from '../../utils/AppError.js';
import { NODE_ENV } from '../../config/env.js';
import User from '../../models/User.js';
import * as tokenHelpers from '../../utils/tokenHelpers.js';

const setCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const loginEmail = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await authService.loginWithEmail(email, password);
  const { accessToken, refreshToken } = authService.createSession(user);
  
  setCookie(res, refreshToken);

  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { accessToken, user }
  });
});

export const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const user = await User.findOne({ phone });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const plainOtp = await otpService.createAndStoreOTP(phone);
  
  const message = `Your EduCore ERP verification code is: ${plainOtp}. Valid for 5 minutes.`;
  await smsService.sendSMS(phone, message);

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    data: null
  });
});

export const loginOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  const isValid = await otpService.verifyOTP(phone, otp);
  if (!isValid) {
    throw new AppError('Invalid or expired OTP', 401);
  }

  const user = await authService.loginWithPhone(phone);
  const { accessToken, refreshToken } = authService.createSession(user);
  
  setCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { accessToken, user }
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies || {};

  if (!refreshToken) {
    throw new AppError('Not authenticated', 401);
  }

  const decoded = tokenHelpers.verifyRefreshToken(refreshToken);
  
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new AppError('Not authenticated', 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = authService.createSession(user);
  
  setCookie(res, newRefreshToken);

  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: { accessToken }
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('refreshToken', 'loggedout', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(Date.now() + 10 * 1000),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  await authService.processForgotPassword(email);

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
    data: null
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  await authService.resetPassword(token, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    data: null
  });
});
