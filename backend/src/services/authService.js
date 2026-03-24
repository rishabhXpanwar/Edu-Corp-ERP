import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import * as tokenHelpers from '../utils/tokenHelpers.js';
import { sendEmail } from './emailService.js';
import { CLIENT_URL } from '../config/env.js';

export const loginWithEmail = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = user.comparePassword
    ? await user.comparePassword(password)
    : await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is inactive', 403);
  }

  return user;
};

export const loginWithPhone = async (phone) => {
  const user = await User.findOne({ phone });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is inactive', 403);
  }

  return user;
};

export const createSession = (user) => {
  const userId = user._id?.toString?.() || user.id?.toString?.() || user.userId?.toString?.();
  const schoolId = user.schoolId ? user.schoolId.toString() : null;

  const tokenPayload = {
    id: userId,
    _id: userId,
    userId,
    role: user.role,
    schoolId,
    email: user.email,
    name: user.name,
  };

  const accessToken = tokenHelpers.generateAccessToken(tokenPayload);
  const refreshToken = tokenHelpers.generateRefreshToken(tokenPayload);
  return { accessToken, refreshToken };
};

export const processForgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const message = `
    <p>You requested a password reset</p>
    <p>Click this link to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: message,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('There was an error sending the email. Try again later!', 500);
  }
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};
