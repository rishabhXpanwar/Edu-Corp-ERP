import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import AppError from '../../utils/AppError.js';
import { auditWriter } from '../../utils/auditWriter.js';
import { getPagination } from '../../utils/paginationHelper.js';
import { BCRYPT_ROUNDS } from '../../config/constants.js';

// ==================== PROFILE ====================

export const getProfile = async (req, res, next) => {
  try {
    console.log('[Controller] getProfile — userId:', req.user._id);
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    console.log('[Controller] updateProfile — userId:', req.user._id);

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (req.file) {
      user.avatarUrl = req.file.path;
    }

    const {
      firstName, lastName, phone, name,
    } = req.body;

    // Support both first/last name or combined name string as the model only has 'name'
    if (firstName || lastName) {
      const newName = `${firstName || ''} ${lastName || ''}`.trim();
      if (newName) user.name = newName;
    } else if (name) {
      user.name = name;
    }

    if (phone) {
      user.phone = phone;
    }

    await user.save();

    // Remove password before sending
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    console.log('[Controller] updatePassword — userId:', req.user._id);

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = user.comparePassword
      ? await user.comparePassword(currentPassword)
      : await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 401);
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ==================== TEACHERS ====================

export const getTeachers = async (req, res, next) => {
  try {
    console.log('[Controller] getTeachers — schoolId:', req.schoolId);

    const { page, limit, skip } = getPagination(req.query);
    const { search } = req.query;

    const filter = {
      schoolId: req.schoolId,
      role: 'teacher',
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [teachers, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Teachers fetched successfully',
      data: {
        items: teachers,
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherById = async (req, res, next) => {
  try {
    console.log('[Controller] getTeacherById — id:', req.params.id);

    const { id } = req.params;

    const teacher = await User.findOne({
      _id: id,
      schoolId: req.schoolId,
      role: 'teacher',
    }).select('-password');

    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Teacher fetched successfully',
      data: { teacher },
    });
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req, res, next) => {
  try {
    console.log('[Controller] createTeacher — schoolId:', req.schoolId);

    const {
      name,
      email,
      phone,
      password,
      subjectsTaught,
      designation,
      joiningDate,
      salary,
      avatarUrl,
    } = req.body;

    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already exists', 409);
    }

    // Generate default password if not provided
    const userPassword = password || 'Teacher@123';
    const hashedPassword = await bcrypt.hash(userPassword, BCRYPT_ROUNDS);

    const teacher = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'teacher',
      schoolId: req.schoolId,
      subjectsTaught: subjectsTaught || [],
      designation: designation || '',
      joiningDate: joiningDate || new Date(),
      salary: salary || 0,
      avatarUrl: avatarUrl || '',
      isActive: true,
      mustChangePassword: !password, // Must change if using default
    });

    await teacher.save();
    console.log('[Controller] createTeacher — teacher created:', teacher._id);

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'CREATE_TEACHER',
      targetModel: 'User',
      targetId: teacher._id,
      metadata: {
        teacherName: teacher.name,
        email: teacher.email,
      },
    });

    // Return teacher without password
    const teacherResponse = teacher.toObject();
    delete teacherResponse.password;

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: { teacher: teacherResponse },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== MANAGERS ====================

const MANAGER_ROLES = ['financeManager', 'hrManager', 'academicManager', 'adminManager'];

export const getManagers = async (req, res, next) => {
  try {
    console.log('[Controller] getManagers — schoolId:', req.schoolId);

    const { page, limit, skip } = getPagination(req.query);
    const { search } = req.query;

    const filter = {
      schoolId: req.schoolId,
      role: { $in: MANAGER_ROLES },
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [managers, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Managers fetched successfully',
      data: {
        items: managers,
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createManager = async (req, res, next) => {
  try {
    console.log('[Controller] createManager — schoolId:', req.schoolId);

    const {
      name,
      email,
      phone,
      role,
      password,
      designation,
      joiningDate,
      salary,
      avatarUrl,
    } = req.body;

    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already exists', 409);
    }

    // Generate default password if not provided
    const userPassword = password || 'Manager@123';
    const hashedPassword = await bcrypt.hash(userPassword, BCRYPT_ROUNDS);

    const manager = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      schoolId: req.schoolId,
      designation: designation || '',
      joiningDate: joiningDate || new Date(),
      salary: salary || 0,
      avatarUrl: avatarUrl || '',
      isActive: true,
      mustChangePassword: !password, // Must change if using default
    });

    await manager.save();
    console.log('[Controller] createManager — manager created:', manager._id);

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'CREATE_MANAGER',
      targetModel: 'User',
      targetId: manager._id,
      metadata: {
        managerName: manager.name,
        email: manager.email,
        role: manager.role,
      },
    });

    // Return manager without password
    const managerResponse = manager.toObject();
    delete managerResponse.password;

    res.status(201).json({
      success: true,
      message: 'Manager created successfully',
      data: { manager: managerResponse },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== USER STATUS ====================

const STAFF_ROLES = ['teacher', ...MANAGER_ROLES];

export const updateUserStatus = async (req, res, next) => {
  try {
    console.log('[Controller] updateUserStatus — id:', req.params.id);

    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findOne({
      _id: id,
      schoolId: req.schoolId,
      role: { $in: STAFF_ROLES },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = isActive;
    await user.save();

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'UPDATE_USER_STATUS',
      targetModel: 'User',
      targetId: user._id,
      metadata: {
        userName: user.name,
        role: user.role,
        isActive,
      },
    });

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};
