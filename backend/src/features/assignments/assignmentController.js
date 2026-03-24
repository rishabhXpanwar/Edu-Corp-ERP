import asyncHandler from '../../utils/asyncHandler.js';
import * as assignmentService from './assignmentService.js';

// @desc    Create a new assignment
// @route   POST /api/v1/assignments
// @access  Teacher, Academic Manager, Principal
export const createAssignment = asyncHandler(async (req, res, next) => {
  const assignmentData = {
    ...req.body,
    teacherId: req.user.userId,
    schoolId: req.user.schoolId,
  };

  const assignment = await assignmentService.createAssignment(assignmentData);

  res.status(201).json({
    success: true,
    message: 'Assignment created successfully',
    data: assignment,
  });
});

// @desc    Get assignments for a section
// @route   GET /api/v1/assignments/section/:sectionId
// @access  Authenticated (Teachers, Students, Parents)
export const getSectionAssignments = asyncHandler(async (req, res, next) => {
  const { sectionId } = req.params;
  const { status, year } = req.query;
  const schoolId = req.user.schoolId;

  const assignments = await assignmentService.getAssignmentsBySection(
    schoolId,
    sectionId,
    { status, year }
  );

  res.status(200).json({
    success: true,
    data: assignments,
  });
});

// @desc    Get assignment by ID
// @route   GET /api/v1/assignments/:id
// @access  Authenticated
export const getAssignmentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const schoolId = req.user.schoolId;

  const assignment = await assignmentService.getAssignmentById(schoolId, id);

  res.status(200).json({
    success: true,
    data: assignment,
  });
});

// @desc    Delete assignment
// @route   DELETE /api/v1/assignments/:id
// @access  Teacher (owner), Academic Manager, Principal
export const deleteAssignment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const schoolId = req.user.schoolId;
  const user = { userId: req.user.userId, role: req.user.role };

  await assignmentService.deleteAssignment(schoolId, id, user);

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully',
  });
});
