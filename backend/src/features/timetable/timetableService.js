import Timetable from '../../models/Timetable.js';
import AcademicYear from '../../models/AcademicYear.js';
import User from '../../models/User.js';
import Section from '../../models/Section.js';
import AppError from '../../utils/AppError.js';

/**
 * Update or create a timetable for a section
 */
export const updateSectionTimetable = async (schoolId, sectionId, schedule) => {
  console.log('[Service] updateSectionTimetable — schoolId:', schoolId, 'sectionId:', sectionId);

  // Verify section exists and belongs to this school
  const section = await Section.findOne({
    _id: sectionId,
    schoolId,
  });

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

  // Verify all teachers exist and belong to this school
  const teacherIds = new Set();
  schedule.forEach((day) => {
    day.periods.forEach((period) => {
      teacherIds.add(period.teacherId);
    });
  });

  const teachers = await User.find({
    _id: { $in: Array.from(teacherIds) },
    schoolId,
    role: 'teacher',
    isActive: true,
  });

  if (teachers.length !== teacherIds.size) {
    throw new AppError('One or more teachers not found or inactive', 400);
  }

  // Upsert the timetable
  const timetable = await Timetable.findOneAndUpdate(
    {
      schoolId,
      sectionId,
      academicYearId: academicYear._id,
    },
    {
      $set: {
        schoolId,
        sectionId,
        academicYearId: academicYear._id,
        schedule,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );

  // Populate teacher details
  const populatedTimetable = await Timetable.findById(timetable._id)
    .populate('sectionId', 'name')
    .populate('academicYearId', 'name')
    .populate('schedule.periods.teacherId', 'name email');

  console.log('[Service] updateSectionTimetable — timetable saved:', timetable._id);

  return populatedTimetable;
};

/**
 * Get the timetable for a specific section
 */
export const getSectionTimetable = async (schoolId, sectionId) => {
  console.log('[Service] getSectionTimetable — schoolId:', schoolId, 'sectionId:', sectionId);

  // Verify section exists and belongs to this school
  const section = await Section.findOne({
    _id: sectionId,
    schoolId,
  });

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  // Get current academic year
  const academicYear = await AcademicYear.findOne({
    schoolId,
    isCurrent: true,
  });

  if (!academicYear) {
    // Return empty timetable shape if no academic year
    return {
      sectionId,
      academicYearId: null,
      schedule: [],
    };
  }

  const timetable = await Timetable.findOne({
    schoolId,
    sectionId,
    academicYearId: academicYear._id,
  })
    .populate('sectionId', 'name')
    .populate('academicYearId', 'name')
    .populate('schedule.periods.teacherId', 'name email');

  if (!timetable) {
    // Return empty timetable shape
    return {
      sectionId,
      academicYearId: academicYear._id,
      schedule: [],
    };
  }

  return timetable;
};

/**
 * Get timetable for the logged-in user (teacher or student)
 */
export const getMyTimetable = async (schoolId, userId, role) => {
  console.log('[Service] getMyTimetable — schoolId:', schoolId, 'userId:', userId, 'role:', role);

  // Get current academic year
  const academicYear = await AcademicYear.findOne({
    schoolId,
    isCurrent: true,
  });

  if (!academicYear) {
    return {
      role,
      schedule: [],
      message: 'No active academic year found',
    };
  }

  if (role === 'student') {
    // Get student's section
    const student = await User.findOne({
      _id: userId,
      schoolId,
      role: 'student',
    });

    if (!student || !student.sectionId) {
      return {
        role,
        schedule: [],
        message: 'Student is not assigned to any section',
      };
    }

    // Get section timetable
    const timetable = await Timetable.findOne({
      schoolId,
      sectionId: student.sectionId,
      academicYearId: academicYear._id,
    })
      .populate('sectionId', 'name')
      .populate('academicYearId', 'name')
      .populate('schedule.periods.teacherId', 'name email');

    if (!timetable) {
      return {
        role,
        sectionId: student.sectionId,
        schedule: [],
        message: 'No timetable found for your section',
      };
    }

    return {
      role,
      sectionId: student.sectionId,
      sectionName: timetable.sectionId?.name,
      academicYear: timetable.academicYearId?.name,
      schedule: timetable.schedule,
    };
  }

  if (role === 'teacher') {
    // Find all timetables where teacher is assigned to any period
    const timetables = await Timetable.find({
      schoolId,
      academicYearId: academicYear._id,
      'schedule.periods.teacherId': userId,
    })
      .populate('sectionId', 'name')
      .populate('academicYearId', 'name');

    if (!timetables || timetables.length === 0) {
      return {
        role,
        schedule: [],
        message: 'No periods assigned to you in the current timetable',
      };
    }

    // Build a merged weekly schedule for the teacher
    const teacherSchedule = [];
    const dayMap = new Map();

    timetables.forEach((timetable) => {
      const sectionName = timetable.sectionId?.name || 'Unknown Section';

      timetable.schedule.forEach((dayObj) => {
        // Filter periods where this teacher is assigned
        const teacherPeriods = dayObj.periods.filter(
          (period) => period.teacherId.toString() === userId.toString(),
        );

        if (teacherPeriods.length > 0) {
          if (!dayMap.has(dayObj.day)) {
            dayMap.set(dayObj.day, []);
          }

          // Add section info to each period
          teacherPeriods.forEach((period) => {
            dayMap.get(dayObj.day).push({
              subject: period.subject,
              startTime: period.startTime,
              endTime: period.endTime,
              sectionId: timetable.sectionId._id,
              sectionName,
            });
          });
        }
      });
    });

    // Convert map to array and sort periods by start time
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    daysOrder.forEach((day) => {
      if (dayMap.has(day)) {
        const periods = dayMap.get(day);
        // Sort periods by start time
        periods.sort((a, b) => a.startTime.localeCompare(b.startTime));
        teacherSchedule.push({
          day,
          periods,
        });
      }
    });

    return {
      role,
      academicYear: academicYear.name,
      schedule: teacherSchedule,
    };
  }

  // For other roles, return empty schedule
  return {
    role,
    schedule: [],
    message: 'Timetable view is available for students and teachers only',
  };
};
