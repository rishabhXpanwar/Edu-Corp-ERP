import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import School from '../../models/School.js';
import User from '../../models/User.js';
import Subscription from '../../models/Subscription.js';
import asyncHandler from '../../utils/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import { getPagination } from '../../utils/paginationHelper.js';
import { auditWriter } from '../../utils/auditWriter.js';
import { sendEmail } from '../../services/emailService.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalSchools = await School.countDocuments();
  const activeSchools = await School.countDocuments({ isActive: true });
  const totalStudents = await User.countDocuments({ role: 'student' });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const revenueResult = await Subscription.aggregate([
    { $unwind: '$billing' },
    { $match: { 'billing.paidAt': { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$billing.amount' } } },
  ]);
  const revenueThisMonth = (revenueResult[0] && revenueResult[0].total) || 0;

  res.status(200).json({
    success: true,
    data: {
      totalSchools, activeSchools, totalStudents, revenueThisMonth,
    },
  });
});

export const getSchools = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = {};

  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
  }

  const items = await School.find(query)
    .populate('principalId', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await School.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      items, total, page, limit, totalPages,
    },
  });
});

export const getSchoolById = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id).populate('principalId', 'name email');
  if (!school) {
    throw new AppError('School not found', 404);
  }

  res.status(200).json({
    success: true,
    data: school,
  });
});

export const createSchool = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingSchool = await School.findOne({ email: req.body.email }).session(session);
    if (existingSchool) {
      throw new AppError('School email already exists', 409);
    }

    const existingUser = await User.findOne({ email: req.body.principalEmail }).session(session);
    if (existingUser) {
      throw new AppError('Principal email already exists in User records', 409);
    }

    const tempPassword = crypto.randomBytes(4).toString('hex');
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS) || 12);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const [principal] = await User.create([{
      name: req.body.principalName,
      email: req.body.principalEmail,
      phone: req.body.principalPhone,
      password: hashedPassword,
      role: 'principal',
      mustChangePassword: true,
    }], { session });

    const [school] = await School.create([{
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      principalId: principal._id,
      plan: req.body.plan,
    }], { session });

    principal.schoolId = school._id;
    await principal.save({ session });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 1);

    await Subscription.create([{
      schoolId: school._id,
      plan: req.body.plan,
      status: 'active',
      startDate,
      endDate,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    await sendEmail({
      to: principal.email,
      subject: 'Welcome to EduCore - Principal Account Created',
      html: `<p>Dear ${principal.name},</p><p>Your account has been created for ${school.name}.</p><p>Your temporary password is: <strong>${tempPassword}</strong></p><p>Please log in and change your password immediately.</p>`,
    });

    res.status(201).json({
      success: true,
      message: 'School created successfully',
      data: school,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

export const suspendSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);
  if (!school) {
    throw new AppError('School not found', 404);
  }

  school.isActive = false;
  await school.save();

  await Subscription.findOneAndUpdate(
    { schoolId: school._id, status: 'active' },
    { status: 'cancelled' },
  );

  await auditWriter({
    actorId: req.user.userId,
    actorRole: req.user.role,
    schoolId: school._id,
    action: 'SCHOOL_SUSPENDED',
    targetModel: 'School',
    targetId: school._id,
    metadata: { reason: 'Suspended by SuperAdmin' },
  });

  res.status(200).json({
    success: true,
    message: 'School suspended successfully',
    data: school,
  });
});

export const reactivateSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);
  if (!school) {
    throw new AppError('School not found', 404);
  }

  school.isActive = true;
  await school.save();

  await Subscription.findOneAndUpdate(
    { schoolId: school._id, status: 'cancelled' },
    { status: 'active' },
  );

  await auditWriter({
    actorId: req.user.userId,
    actorRole: req.user.role,
    schoolId: school._id,
    action: 'SCHOOL_REACTIVATED',
    targetModel: 'School',
    targetId: school._id,
    metadata: { reason: 'Reactivated by SuperAdmin' },
  });

  res.status(200).json({
    success: true,
    message: 'School reactivated successfully',
    data: school,
  });
});
