import * as timetableService from './timetableService.js';
import { auditWriter } from '../../utils/auditWriter.js';

// ==================== UPDATE TIMETABLE ====================

export const updateTimetable = async (req, res, next) => {
  try {
    console.log('[Controller] updateTimetable — schoolId:', req.schoolId, 'sectionId:', req.params.sectionId);

    const { sectionId } = req.params;
    const { schedule } = req.body;

    const timetable = await timetableService.updateSectionTimetable(
      req.schoolId,
      sectionId,
      schedule,
    );

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'UPDATE_TIMETABLE',
      targetModel: 'Timetable',
      targetId: timetable._id,
      metadata: {
        sectionId,
        daysCount: schedule.length,
        totalPeriods: schedule.reduce((sum, day) => sum + day.periods.length, 0),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Timetable updated successfully',
      data: { timetable },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET SECTION TIMETABLE ====================

export const getSectionTimetable = async (req, res, next) => {
  try {
    console.log('[Controller] getSectionTimetable — sectionId:', req.params.sectionId);

    const { sectionId } = req.params;

    const timetable = await timetableService.getSectionTimetable(
      req.schoolId,
      sectionId,
    );

    res.status(200).json({
      success: true,
      message: 'Timetable fetched successfully',
      data: { timetable },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET MY TIMETABLE ====================

export const getMyTimetable = async (req, res, next) => {
  try {
    console.log('[Controller] getMyTimetable — userId:', req.user._id, 'role:', req.user.role);

    const timetable = await timetableService.getMyTimetable(
      req.schoolId,
      req.user._id,
      req.user.role,
    );

    res.status(200).json({
      success: true,
      message: 'My timetable fetched successfully',
      data: { timetable },
    });
  } catch (error) {
    next(error);
  }
};
