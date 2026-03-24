import mongoose from 'mongoose';
import AcademicYear from '../../models/AcademicYear.js';
import Class from '../../models/Class.js';
import Section from '../../models/Section.js';
import AppError from '../../utils/AppError.js';
import { auditWriter } from '../../utils/auditWriter.js';

// ==================== ACADEMIC YEARS ====================

export const getAcademicYears = async (req, res, next) => {
  try {
    console.log('[Controller] getAcademicYears — schoolId:', req.schoolId);

    const academicYears = await AcademicYear.find({ schoolId: req.schoolId })
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      message: 'Academic years fetched successfully',
      data: { academicYears },
    });
  } catch (error) {
    next(error);
  }
};

export const createAcademicYear = async (req, res, next) => {
  try {
    console.log('[Controller] createAcademicYear — schoolId:', req.schoolId);

    const { name, startDate, endDate } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      throw new AppError('Start date must be before end date', 400);
    }

    const academicYear = new AcademicYear({
      name,
      startDate,
      endDate,
      schoolId: req.schoolId,
    });

    await academicYear.save();

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'CREATE_ACADEMIC_YEAR',
      targetModel: 'AcademicYear',
      targetId: academicYear._id,
      metadata: { name, startDate, endDate },
    });

    res.status(201).json({
      success: true,
      message: 'Academic year created successfully',
      data: { academicYear },
    });
  } catch (error) {
    next(error);
  }
};

export const setCurrentAcademicYear = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('[Controller] setCurrentAcademicYear — id:', req.params.id);

    const { id } = req.params;

    // Verify the academic year exists and belongs to this school
    const academicYear = await AcademicYear.findOne({
      _id: id,
      schoolId: req.schoolId,
    }).session(session);

    if (!academicYear) {
      throw new AppError('Academic year not found', 404);
    }

    // Set all academic years for this school to not current
    await AcademicYear.updateMany(
      { schoolId: req.schoolId },
      { isCurrent: false },
      { session },
    );

    // Set the specified academic year as current
    academicYear.isCurrent = true;
    await academicYear.save({ session });

    await session.commitTransaction();

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'SET_CURRENT_ACADEMIC_YEAR',
      targetModel: 'AcademicYear',
      targetId: academicYear._id,
      metadata: { name: academicYear.name },
    });

    res.status(200).json({
      success: true,
      message: 'Current academic year updated successfully',
      data: { academicYear },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ==================== CLASSES ====================

export const getClasses = async (req, res, next) => {
  try {
    console.log('[Controller] getClasses — schoolId:', req.schoolId);

    const { academicYearId } = req.query;
    const filter = { schoolId: req.schoolId };

    if (academicYearId) {
      filter.academicYearId = academicYearId;
    }

    const classes = await Class.find(filter)
      .populate('sections')
      .populate('academicYearId', 'name isCurrent')
      .sort({ level: 1, name: 1 });

    res.status(200).json({
      success: true,
      message: 'Classes fetched successfully',
      data: { classes },
    });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req, res, next) => {
  try {
    console.log('[Controller] createClass — schoolId:', req.schoolId);

    const { name, level, academicYearId } = req.body;

    // Verify academic year belongs to this school
    const academicYear = await AcademicYear.findOne({
      _id: academicYearId,
      schoolId: req.schoolId,
    });

    if (!academicYear) {
      throw new AppError('Academic year not found', 404);
    }

    const newClass = new Class({
      name,
      level,
      academicYearId,
      schoolId: req.schoolId,
    });

    await newClass.save();

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'CREATE_CLASS',
      targetModel: 'Class',
      targetId: newClass._id,
      metadata: { name, level, academicYearId },
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: { class: newClass },
    });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    console.log('[Controller] updateClass — id:', req.params.id);

    const { id } = req.params;
    const { name, level } = req.body;

    const classDoc = await Class.findOne({
      _id: id,
      schoolId: req.schoolId,
    });

    if (!classDoc) {
      throw new AppError('Class not found', 404);
    }

    if (name !== undefined) classDoc.name = name;
    if (level !== undefined) classDoc.level = level;

    await classDoc.save();

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: { class: classDoc },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    console.log('[Controller] deleteClass — id:', req.params.id);

    const { id } = req.params;

    const classDoc = await Class.findOne({
      _id: id,
      schoolId: req.schoolId,
    });

    if (!classDoc) {
      throw new AppError('Class not found', 404);
    }

    // Delete all sections belonging to this class
    await Section.deleteMany({ classId: id, schoolId: req.schoolId });

    // Delete the class
    await Class.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SECTIONS ====================

export const createSection = async (req, res, next) => {
  try {
    console.log('[Controller] createSection — classId:', req.params.id);

    const { id: classId } = req.params;
    const { name, classTeacherId } = req.body;

    // Verify class belongs to this school
    const classDoc = await Class.findOne({
      _id: classId,
      schoolId: req.schoolId,
    });

    if (!classDoc) {
      throw new AppError('Class not found', 404);
    }

    const section = new Section({
      name,
      classId,
      classTeacherId: classTeacherId || null,
      schoolId: req.schoolId,
    });

    await section.save();

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'CREATE_SECTION',
      targetModel: 'Section',
      targetId: section._id,
      metadata: { name, classId, classTeacherId },
    });

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: { section },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSection = async (req, res, next) => {
  try {
    console.log('[Controller] updateSection — secId:', req.params.secId);

    const { id: classId, secId } = req.params;
    const { name, classTeacherId } = req.body;

    // Verify class belongs to this school
    const classDoc = await Class.findOne({
      _id: classId,
      schoolId: req.schoolId,
    });

    if (!classDoc) {
      throw new AppError('Class not found', 404);
    }

    const section = await Section.findOne({
      _id: secId,
      classId,
      schoolId: req.schoolId,
    });

    if (!section) {
      throw new AppError('Section not found', 404);
    }

    if (name !== undefined) section.name = name;
    if (classTeacherId !== undefined) section.classTeacherId = classTeacherId || null;

    await section.save();

    res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      data: { section },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSection = async (req, res, next) => {
  try {
    console.log('[Controller] deleteSection — secId:', req.params.secId);

    const { id: classId, secId } = req.params;

    // Verify class belongs to this school
    const classDoc = await Class.findOne({
      _id: classId,
      schoolId: req.schoolId,
    });

    if (!classDoc) {
      throw new AppError('Class not found', 404);
    }

    const section = await Section.findOne({
      _id: secId,
      classId,
      schoolId: req.schoolId,
    });

    if (!section) {
      throw new AppError('Section not found', 404);
    }

    await Section.deleteOne({ _id: secId });

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
