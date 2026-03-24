import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Class from '../../models/Class.js';
import Section from '../../models/Section.js';
import AppError from '../../utils/AppError.js';
import { auditWriter } from '../../utils/auditWriter.js';
import { getPagination } from '../../utils/paginationHelper.js';
import { BCRYPT_ROUNDS } from '../../config/constants.js';

// ==================== GET STUDENTS ====================

export const getStudents = async (req, res, next) => {
  try {
    console.log('[Controller] getStudents — schoolId:', req.schoolId);

    const { page, limit, skip } = getPagination(req.query);
    const { classId, sectionId, search } = req.query;

    // Build filter
    const filter = {
      schoolId: req.schoolId,
      role: 'student',
      isActive: true,
    };

    if (classId) {
      filter.classId = classId;
    }

    if (sectionId) {
      filter.sectionId = sectionId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [students, total] = await Promise.all([
      User.find(filter)
        .populate('classId', 'name level')
        .populate('sectionId', 'name')
        .populate('parentId', 'name email phone')
        .select('-password')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Students fetched successfully',
      data: {
        items: students,
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

// ==================== GET STUDENT BY ID ====================

export const getStudentById = async (req, res, next) => {
  try {
    console.log('[Controller] getStudentById — id:', req.params.id);

    const { id } = req.params;

    const student = await User.findOne({
      _id: id,
      schoolId: req.schoolId,
      role: 'student',
    })
      .populate('classId', 'name level')
      .populate('sectionId', 'name')
      .populate('parentId', 'name email phone avatarUrl')
      .select('-password');

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Fetch the full parent document separately for complete parent details
    let parent = null;
    if (student.parentId) {
      parent = await User.findById(student.parentId._id).select('-password');
    }

    res.status(200).json({
      success: true,
      message: 'Student fetched successfully',
      data: {
        student,
        parent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE STUDENT ====================

export const createStudent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('[Controller] createStudent — schoolId:', req.schoolId);

    const { student: studentData, parent: parentData } = req.body;

    // Verify class belongs to this school
    const classDoc = await Class.findOne({
      _id: studentData.classId,
      schoolId: req.schoolId,
    }).session(session);

    if (!classDoc) {
      throw new AppError('Class not found', 404);
    }

    // Verify section belongs to this class and school
    const sectionDoc = await Section.findOne({
      _id: studentData.sectionId,
      classId: studentData.classId,
      schoolId: req.schoolId,
    }).session(session);

    if (!sectionDoc) {
      throw new AppError('Section not found', 404);
    }

    // Check for duplicate student email
    const existingStudent = await User.findOne({
      email: studentData.email,
    }).session(session);

    if (existingStudent) {
      throw new AppError('Student email already exists', 409);
    }

    // Check for duplicate parent email
    const existingParent = await User.findOne({
      email: parentData.email,
    }).session(session);

    if (existingParent) {
      throw new AppError('Parent email already exists', 409);
    }

    // Check for duplicate admission number within school
    const existingAdmission = await User.findOne({
      admissionNumber: studentData.admissionNumber,
      schoolId: req.schoolId,
    }).session(session);

    if (existingAdmission) {
      throw new AppError('Admission number already exists', 409);
    }

    // Generate default passwords if not provided
    const studentPassword = studentData.password || 'Student@123';
    const parentPassword = parentData.password || 'Parent@123';

    // Hash passwords
    const hashedStudentPassword = await bcrypt.hash(studentPassword, BCRYPT_ROUNDS);
    const hashedParentPassword = await bcrypt.hash(parentPassword, BCRYPT_ROUNDS);

    // Create parent first
    const parent = new User({
      name: parentData.name,
      email: parentData.email,
      phone: parentData.phone,
      password: hashedParentPassword,
      role: 'parent',
      schoolId: req.schoolId,
      avatarUrl: parentData.avatarUrl || '',
      isActive: true,
      mustChangePassword: !parentData.password, // Must change if using default
      studentIds: [], // Will be updated after student creation
    });

    await parent.save({ session });
    console.log('[Controller] createStudent — parent created:', parent._id);

    // Create student with parentId
    const student = new User({
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      password: hashedStudentPassword,
      role: 'student',
      schoolId: req.schoolId,
      avatarUrl: studentData.avatarUrl || '',
      isActive: true,
      mustChangePassword: !studentData.password, // Must change if using default
      admissionNumber: studentData.admissionNumber,
      classId: studentData.classId,
      sectionId: studentData.sectionId,
      parentId: parent._id,
    });

    await student.save({ session });
    console.log('[Controller] createStudent — student created:', student._id);

    // Update parent's studentIds array
    parent.studentIds.push(student._id);
    await parent.save({ session });

    await session.commitTransaction();

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'ADMIT_STUDENT',
      targetModel: 'User',
      targetId: student._id,
      metadata: {
        studentName: student.name,
        admissionNumber: student.admissionNumber,
        parentName: parent.name,
        className: classDoc.name,
        sectionName: sectionDoc.name,
      },
    });

    // Return student and parent without passwords
    const studentResponse = student.toObject();
    delete studentResponse.password;

    const parentResponse = parent.toObject();
    delete parentResponse.password;

    res.status(201).json({
      success: true,
      message: 'Student admitted successfully',
      data: {
        student: studentResponse,
        parent: parentResponse,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ==================== UPDATE STUDENT ====================

export const updateStudent = async (req, res, next) => {
  try {
    console.log('[Controller] updateStudent — id:', req.params.id);

    const { id } = req.params;
    const { student: studentData, parent: parentData } = req.body;

    // Find the student
    const student = await User.findOne({
      _id: id,
      schoolId: req.schoolId,
      role: 'student',
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Update student fields if provided
    if (studentData) {
      // If changing class/section, verify they exist
      if (studentData.classId) {
        const classDoc = await Class.findOne({
          _id: studentData.classId,
          schoolId: req.schoolId,
        });
        if (!classDoc) {
          throw new AppError('Class not found', 404);
        }
      }

      if (studentData.sectionId) {
        const classIdForSection = studentData.classId || student.classId;
        const sectionDoc = await Section.findOne({
          _id: studentData.sectionId,
          classId: classIdForSection,
          schoolId: req.schoolId,
        });
        if (!sectionDoc) {
          throw new AppError('Section not found', 404);
        }
      }

      // Check for duplicate email if changing
      if (studentData.email && studentData.email !== student.email) {
        const existingEmail = await User.findOne({ email: studentData.email });
        if (existingEmail) {
          throw new AppError('Email already exists', 409);
        }
      }

      // Check for duplicate admission number if changing
      if (studentData.admissionNumber && studentData.admissionNumber !== student.admissionNumber) {
        const existingAdmission = await User.findOne({
          admissionNumber: studentData.admissionNumber,
          schoolId: req.schoolId,
        });
        if (existingAdmission) {
          throw new AppError('Admission number already exists', 409);
        }
      }

      // Apply student updates
      if (studentData.name !== undefined) student.name = studentData.name;
      if (studentData.email !== undefined) student.email = studentData.email;
      if (studentData.phone !== undefined) student.phone = studentData.phone;
      if (studentData.admissionNumber !== undefined) {
        student.admissionNumber = studentData.admissionNumber;
      }
      if (studentData.classId !== undefined) student.classId = studentData.classId;
      if (studentData.sectionId !== undefined) student.sectionId = studentData.sectionId;
      if (studentData.avatarUrl !== undefined) student.avatarUrl = studentData.avatarUrl;
    }

    await student.save();

    // Update parent if parentData provided and student has a parent
    let parent = null;
    if (parentData && student.parentId) {
      parent = await User.findById(student.parentId);
      if (parent) {
        // Check for duplicate email if changing
        if (parentData.email && parentData.email !== parent.email) {
          const existingEmail = await User.findOne({ email: parentData.email });
          if (existingEmail) {
            throw new AppError('Parent email already exists', 409);
          }
        }

        if (parentData.name !== undefined) parent.name = parentData.name;
        if (parentData.email !== undefined) parent.email = parentData.email;
        if (parentData.phone !== undefined) parent.phone = parentData.phone;
        if (parentData.avatarUrl !== undefined) parent.avatarUrl = parentData.avatarUrl;

        await parent.save();
      }
    }

    // Return updated student
    const studentResponse = await User.findById(student._id)
      .populate('classId', 'name level')
      .populate('sectionId', 'name')
      .populate('parentId', 'name email phone')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: { student: studentResponse },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DEACTIVATE STUDENT ====================

export const deactivateStudent = async (req, res, next) => {
  try {
    console.log('[Controller] deactivateStudent — id:', req.params.id);

    const { id } = req.params;

    const student = await User.findOne({
      _id: id,
      schoolId: req.schoolId,
      role: 'student',
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Deactivate student
    student.isActive = false;
    await student.save();

    // Deactivate parent if exists
    if (student.parentId) {
      const parent = await User.findById(student.parentId);
      if (parent) {
        // Check if parent has other active students
        const otherActiveStudents = await User.countDocuments({
          parentId: parent._id,
          isActive: true,
          _id: { $ne: student._id },
        });

        // Only deactivate parent if no other active students
        if (otherActiveStudents === 0) {
          parent.isActive = false;
          await parent.save();
          console.log('[Controller] deactivateStudent — parent deactivated:', parent._id);
        }
      }
    }

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'DEACTIVATE_STUDENT',
      targetModel: 'User',
      targetId: student._id,
      metadata: {
        studentName: student.name,
        admissionNumber: student.admissionNumber,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Student deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
