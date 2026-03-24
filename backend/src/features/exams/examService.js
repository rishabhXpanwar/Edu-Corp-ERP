import Exam from '../../models/Exam.js';
import AcademicYear from '../../models/AcademicYear.js';
import Class from '../../models/Class.js';
import Section from '../../models/Section.js';
import AppError from '../../utils/AppError.js';

/**
 * Create a new exam
 */
export const createExam = async (schoolId, data) => {
  console.log('[Service] createExam — schoolId:', schoolId);

  const { title, startDate, endDate, classes, dateSheet } = data;

  // Get current academic year
  const academicYear = await AcademicYear.findOne({
    schoolId,
    isCurrent: true,
  });

  if (!academicYear) {
    throw new AppError('No active academic year found', 400);
  }

  // Verify all classes exist and belong to this school
  const classIds = classes;
  const classDocuments = await Class.find({
    _id: { $in: classIds },
    schoolId,
  });

  if (classDocuments.length !== classIds.length) {
    throw new AppError('One or more classes not found', 400);
  }

  // Verify all sections in dateSheet exist and belong to this school
  const sectionIds = dateSheet.map((entry) => entry.sectionId);
  const sections = await Section.find({
    _id: { $in: sectionIds },
    schoolId,
  });

  if (sections.length !== sectionIds.length) {
    throw new AppError('One or more sections not found', 400);
  }

  // Create the exam
  const exam = await Exam.create({
    schoolId,
    academicYearId: academicYear._id,
    title,
    startDate,
    endDate,
    classes: classIds,
    dateSheet,
    status: 'upcoming',
  });

  console.log('[Service] createExam — exam created:', exam._id);

  // Populate and return
  const populatedExam = await Exam.findById(exam._id)
    .populate('classes', 'name level')
    .populate('dateSheet.classId', 'name level')
    .populate('dateSheet.sectionId', 'name');

  return populatedExam;
};

/**
 * Get all exams for a school with optional filters
 */
export const getExams = async (schoolId, query) => {
  console.log('[Service] getExams — schoolId:', schoolId, 'query:', query);

  const { status, year } = query;

  // Get current academic year if no year specified
  let academicYearId;
  if (year) {
    const academicYears = await AcademicYear.find({
      schoolId,
      $expr: {
        $eq: [{ $year: '$startDate' }, parseInt(year, 10)],
      },
    });
    if (academicYears.length > 0) {
      academicYearId = academicYears[0]._id;
    } else {
      // No academic year found for that year, return empty
      return [];
    }
  } else {
    const currentYear = await AcademicYear.findOne({
      schoolId,
      isCurrent: true,
    });
    if (currentYear) {
      academicYearId = currentYear._id;
    }
  }

  // Build filter
  const filter = { schoolId };
  if (academicYearId) {
    filter.academicYearId = academicYearId;
  }
  if (status) {
    filter.status = status;
  }

  const exams = await Exam.find(filter)
    .populate('classes', 'name level')
    .populate('academicYearId', 'name')
    .sort({ startDate: -1 });

  return exams;
};

/**
 * Get a single exam by ID
 */
export const getExamById = async (schoolId, examId) => {
  console.log('[Service] getExamById — examId:', examId);

  const exam = await Exam.findOne({
    _id: examId,
    schoolId,
  })
    .populate('classes', 'name level')
    .populate('academicYearId', 'name')
    .populate('dateSheet.classId', 'name level')
    .populate('dateSheet.sectionId', 'name');

  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  return exam;
};

/**
 * Update an exam
 */
export const updateExam = async (schoolId, examId, updates) => {
  console.log('[Service] updateExam — examId:', examId);

  // Find exam
  const exam = await Exam.findOne({
    _id: examId,
    schoolId,
  });

  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  // If updating classes, verify they exist
  if (updates.classes) {
    const classDocuments = await Class.find({
      _id: { $in: updates.classes },
      schoolId,
    });

    if (classDocuments.length !== updates.classes.length) {
      throw new AppError('One or more classes not found', 400);
    }
  }

  // If updating dateSheet, verify sections exist
  if (updates.dateSheet) {
    const sectionIds = updates.dateSheet.map((entry) => entry.sectionId);
    const sections = await Section.find({
      _id: { $in: sectionIds },
      schoolId,
    });

    if (sections.length !== sectionIds.length) {
      throw new AppError('One or more sections not found', 400);
    }
  }

  // Update the exam
  const updatedExam = await Exam.findByIdAndUpdate(
    examId,
    { $set: updates },
    { new: true, runValidators: true },
  )
    .populate('classes', 'name level')
    .populate('academicYearId', 'name')
    .populate('dateSheet.classId', 'name level')
    .populate('dateSheet.sectionId', 'name');

  console.log('[Service] updateExam — exam updated:', examId);

  return updatedExam;
};

/**
 * Delete an exam
 */
export const deleteExam = async (schoolId, examId) => {
  console.log('[Service] deleteExam — examId:', examId);

  const exam = await Exam.findOne({
    _id: examId,
    schoolId,
  });

  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  await Exam.findByIdAndDelete(examId);

  console.log('[Service] deleteExam — exam deleted:', examId);

  return exam;
};
