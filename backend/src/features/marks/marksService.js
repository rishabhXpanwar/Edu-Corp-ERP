import Marks from '../../models/Marks.js';
import Exam from '../../models/Exam.js';
import Section from '../../models/Section.js';
import User from '../../models/User.js';
import AcademicYear from '../../models/AcademicYear.js';
import AppError from '../../utils/AppError.js';

/**
 * Upsert marks for an entire section (bulk entry)
 */
export const upsertMarksForSection = async (schoolId, data) => {
  console.log('[Service] upsertMarksForSection — schoolId:', schoolId);

  const { examId, sectionId, marksData } = data;

  // Verify exam exists and belongs to school
  const exam = await Exam.findOne({ _id: examId, schoolId });
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  // Verify section exists and belongs to school
  const section = await Section.findOne({ _id: sectionId, schoolId });
  if (!section) {
    throw new AppError('Section not found', 404);
  }

  // Get current academic year
  const academicYear = await AcademicYear.findOne({
    schoolId,
    isCurrent: true,
  });

  if (!academicYear) {
    throw new AppError('No active academic year found', 400);
  }

  // Verify all students exist and belong to this school
  const studentIds = marksData.map((item) => item.studentId);
  const students = await User.find({
    _id: { $in: studentIds },
    schoolId,
    role: 'student',
  });

  if (students.length !== studentIds.length) {
    throw new AppError('One or more students not found', 400);
  }

  // Upsert marks for each student
  const results = [];
  for (const studentMarksData of marksData) {
    const { studentId, subjects } = studentMarksData;

    const marks = await Marks.findOneAndUpdate(
      {
        schoolId,
        academicYearId: academicYear._id,
        examId,
        sectionId,
        studentId,
      },
      {
        $set: {
          subjects,
          status: 'draft', // Keep as draft when saving
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    ).populate('studentId', 'firstName lastName rollNumber');

    results.push(marks);
  }

  console.log('[Service] upsertMarksForSection — upserted', results.length, 'records');

  return results;
};

/**
 * Get all marks for a section in an exam
 */
export const getMarksBySection = async (schoolId, examId, sectionId) => {
  console.log('[Service] getMarksBySection — examId:', examId, 'sectionId:', sectionId);

  // Verify exam and section exist
  const exam = await Exam.findOne({ _id: examId, schoolId });
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  const section = await Section.findOne({ _id: sectionId, schoolId });
  if (!section) {
    throw new AppError('Section not found', 404);
  }

  const marks = await Marks.find({
    schoolId,
    examId,
    sectionId,
  })
    .populate('studentId', 'firstName lastName rollNumber')
    .sort({ 'studentId.rollNumber': 1 });

  return marks;
};

/**
 * Publish marks for a section (change status from draft to published)
 */
export const publishSectionMarks = async (schoolId, examId, sectionId) => {
  console.log('[Service] publishSectionMarks — examId:', examId, 'sectionId:', sectionId);

  // Verify exam and section exist
  const exam = await Exam.findOne({ _id: examId, schoolId });
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  const section = await Section.findOne({ _id: sectionId, schoolId });
  if (!section) {
    throw new AppError('Section not found', 404);
  }

  // Update all marks for this exam and section to published
  const result = await Marks.updateMany(
    {
      schoolId,
      examId,
      sectionId,
      status: 'draft',
    },
    {
      $set: { status: 'published' },
    },
  );

  console.log('[Service] publishSectionMarks — published', result.modifiedCount, 'records');

  return {
    modifiedCount: result.modifiedCount,
    message: `${result.modifiedCount} marks records published successfully`,
  };
};

/**
 * Get marks for a specific student in an exam
 */
export const getStudentMarks = async (schoolId, studentId, examId, requesterRole) => {
  console.log('[Service] getStudentMarks — studentId:', studentId, 'examId:', examId);

  // Verify student exists
  const student = await User.findOne({
    _id: studentId,
    schoolId,
    role: 'student',
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Verify exam exists
  const exam = await Exam.findOne({ _id: examId, schoolId });
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  // Build filter - only show published marks unless requester is staff
  const filter = {
    schoolId,
    examId,
    studentId,
  };

  // If requester is not staff, only show published marks
  const staffRoles = ['teacher', 'academicManager', 'manager', 'principal', 'superAdmin'];
  if (!staffRoles.includes(requesterRole)) {
    filter.status = 'published';
  }

  const marks = await Marks.findOne(filter)
    .populate('studentId', 'firstName lastName rollNumber')
    .populate('examId', 'title startDate endDate')
    .populate('sectionId', 'name');

  if (!marks) {
    throw new AppError('Marks not found', 404);
  }

  return marks;
};
