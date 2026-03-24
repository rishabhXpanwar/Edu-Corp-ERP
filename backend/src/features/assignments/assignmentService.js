import Assignment from '../../models/Assignment.js';
import AcademicYear from '../../models/AcademicYear.js';
import School from '../../models/School.js';
import AppError from '../../utils/AppError.js';

/**
 * Creates a new assignment
 * @param {Object} data - Assignment data
 * @param {String} data.title
 * @param {String} data.description
 * @param {String} data.subject
 * @param {String} data.classId
 * @param {String} data.sectionId
 * @param {String} data.teacherId
 * @param {String} data.schoolId
 * @param {Date} data.dueDate
 * @param {Array} data.attachments
 * @returns {Promise<Object>} - Created assignment
 */
export const createAssignment = async (data) => {
  // 1. Find current academic year for the school
  const academicYear = await AcademicYear.findOne({
    schoolId: data.schoolId,
    isCurrent: true,
  });

  if (!academicYear) {
    throw new AppError('Current academic year not found', 404);
  }

  // 2. Create the assignment
  const assignment = await Assignment.create({
    ...data,
    academicYearId: academicYear._id,
  });

  return assignment;
};

/**
 * Get assignments for a specific section
 * @param {String} schoolId
 * @param {String} sectionId
 * @param {Object} query - { status, year }
 * @returns {Promise<Array>} - List of assignments
 */
export const getAssignmentsBySection = async (schoolId, sectionId, query) => {
  const filter = {
    schoolId,
    sectionId,
  };

  // If status is provided, filter by due date relative to now
  if (query.status) {
    const now = new Date();
    if (query.status === 'upcoming') {
      filter.dueDate = { $gte: now };
    } else if (query.status === 'completed') {
      filter.dueDate = { $lt: now };
    }
  }

  // If year is provided (e.g., '2023-2024'), find the academic year ID first
  if (query.year) {
    const academicYear = await AcademicYear.findOne({
      schoolId,
      name: query.year,
    });
    if (academicYear) {
      filter.academicYearId = academicYear._id;
    }
  }

  const assignments = await Assignment.find(filter)
    .sort({ dueDate: 1 }) // Closest due date first
    .populate('teacherId', 'name email');

  return assignments;
};

/**
 * Get assignment by ID
 * @param {String} schoolId
 * @param {String} assignmentId
 * @returns {Promise<Object>} - Assignment details
 */
export const getAssignmentById = async (schoolId, assignmentId) => {
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    schoolId,
  }).populate('teacherId', 'name email');

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  return assignment;
};

/**
 * Delete assignment by ID
 * @param {String} schoolId
 * @param {String} assignmentId
 * @param {Object} user - Requester { userId, role }
 * @returns {Promise<void>}
 */
export const deleteAssignment = async (schoolId, assignmentId, user) => {
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    schoolId,
  });

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  // Check if user is authorized to delete
  // Principal and Academic Manager can delete any assignment
  // Teachers can only delete their own assignments
  if (user.role === 'teacher' && assignment.teacherId.toString() !== user.userId) {
    throw new AppError('You can only delete your own assignments', 403);
  }

  await assignment.deleteOne();
};
