import Attendance from '../../models/Attendance.js';
import Section from '../../models/Section.js';
import Class from '../../models/Class.js';
import AcademicYear from '../../models/AcademicYear.js';
import User from '../../models/User.js';
import AppError from '../../utils/AppError.js';
import { auditWriter } from '../../utils/auditWriter.js';

// ==================== MARK ATTENDANCE ====================

export const markAttendance = async (req, res, next) => {
  try {
    console.log('[Controller] markAttendance — schoolId:', req.schoolId);

    const { date, sectionId, classId, records } = req.body;

    // Parse date to start of day for consistent comparison
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Verify section belongs to this school and class
    const section = await Section.findOne({
      _id: sectionId,
      classId,
      schoolId: req.schoolId,
    });

    if (!section) {
      throw new AppError('Section not found', 404);
    }

    // Verify class belongs to this school
    const classDoc = await Class.findOne({
      _id: classId,
      schoolId: req.schoolId,
    });

    if (!classDoc) {
      throw new AppError('Class not found', 404);
    }

    // Get current academic year
    const academicYear = await AcademicYear.findOne({
      schoolId: req.schoolId,
      isCurrent: true,
    });

    if (!academicYear) {
      throw new AppError('No active academic year found', 400);
    }

    // Verify all students exist and belong to this section
    const studentIds = records.map((r) => r.studentId);
    const students = await User.find({
      _id: { $in: studentIds },
      schoolId: req.schoolId,
      sectionId,
      role: 'student',
      isActive: true,
    });

    if (students.length !== studentIds.length) {
      throw new AppError('One or more students not found in this section', 400);
    }

    // Prepare records with optional remarks
    const attendanceRecords = records.map((r) => ({
      studentId: r.studentId,
      status: r.status,
      remarks: r.remarks || '',
    }));

    // Upsert attendance record
    const attendance = await Attendance.findOneAndUpdate(
      {
        schoolId: req.schoolId,
        sectionId,
        date: attendanceDate,
      },
      {
        $set: {
          schoolId: req.schoolId,
          academicYearId: academicYear._id,
          classId,
          sectionId,
          date: attendanceDate,
          records: attendanceRecords,
          markedBy: req.user._id,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    console.log('[Controller] markAttendance — attendance saved:', attendance._id);

    // Audit log
    await auditWriter({
      actorId: req.user._id,
      actorRole: req.user.role,
      schoolId: req.schoolId,
      action: 'MARK_ATTENDANCE',
      targetModel: 'Attendance',
      targetId: attendance._id,
      metadata: {
        date: attendanceDate.toISOString(),
        sectionId,
        classId,
        studentCount: records.length,
      },
    });

    // Populate the response
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('sectionId', 'name')
      .populate('classId', 'name level')
      .populate('markedBy', 'name')
      .populate('records.studentId', 'name admissionNumber');

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: populatedAttendance,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ATTENDANCE BY SECTION ====================

export const getAttendanceBySection = async (req, res, next) => {
  try {
    console.log('[Controller] getAttendanceBySection — sectionId:', req.params.id);

    const { id: sectionId } = req.params;
    const { date, month, year } = req.query;

    // Verify section belongs to this school
    const section = await Section.findOne({
      _id: sectionId,
      schoolId: req.schoolId,
    });

    if (!section) {
      throw new AppError('Section not found', 404);
    }

    // Build date filter
    const dateFilter = { schoolId: req.schoolId, sectionId };

    if (date) {
      // Specific date
      const specificDate = new Date(date);
      specificDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(specificDate);
      nextDay.setDate(nextDay.getDate() + 1);
      dateFilter.date = { $gte: specificDate, $lt: nextDay };
    } else if (month && year) {
      // Month range
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      // Year range
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter.date = { $gte: startDate, $lte: endDate };
    }

    const attendanceRecords = await Attendance.find(dateFilter)
      .populate('classId', 'name level')
      .populate('sectionId', 'name')
      .populate('markedBy', 'name')
      .populate('records.studentId', 'name admissionNumber')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: 'Attendance records fetched successfully',
      data: attendanceRecords,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ATTENDANCE BY STUDENT ====================

export const getAttendanceByStudent = async (req, res, next) => {
  try {
    console.log('[Controller] getAttendanceByStudent — studentId:', req.params.id);

    const { id: studentId } = req.params;
    const { date, month, year } = req.query;

    // Verify student exists and belongs to this school
    const student = await User.findOne({
      _id: studentId,
      schoolId: req.schoolId,
      role: 'student',
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Build date filter
    const dateFilter = {
      schoolId: req.schoolId,
      'records.studentId': studentId,
    };

    if (date) {
      // Specific date
      const specificDate = new Date(date);
      specificDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(specificDate);
      nextDay.setDate(nextDay.getDate() + 1);
      dateFilter.date = { $gte: specificDate, $lt: nextDay };
    } else if (month && year) {
      // Month range
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      // Year range
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter.date = { $gte: startDate, $lte: endDate };
    }

    const attendanceRecords = await Attendance.find(dateFilter)
      .populate('classId', 'name level')
      .populate('sectionId', 'name')
      .sort({ date: -1 });

    // Extract only this student's attendance from each record
    const studentAttendance = attendanceRecords.map((record) => {
      const studentRecord = record.records.find(
        (r) => r.studentId.toString() === studentId,
      );
      return {
        _id: record._id,
        date: record.date,
        classId: record.classId,
        sectionId: record.sectionId,
        status: studentRecord?.status || null,
        remarks: studentRecord?.remarks || '',
      };
    });

    res.status(200).json({
      success: true,
      message: 'Student attendance records fetched successfully',
      data: {
        student: {
          _id: student._id,
          name: student.name,
          admissionNumber: student.admissionNumber,
        },
        attendance: studentAttendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ATTENDANCE REPORT ====================

export const getAttendanceReport = async (req, res, next) => {
  try {
    console.log('[Controller] getAttendanceReport — schoolId:', req.schoolId);

    const { sectionId, classId, month, year } = req.query;

    // Build filter
    const filter = { schoolId: req.schoolId };

    if (sectionId) {
      // Verify section belongs to this school
      const section = await Section.findOne({
        _id: sectionId,
        schoolId: req.schoolId,
      });
      if (!section) {
        throw new AppError('Section not found', 404);
      }
      filter.sectionId = sectionId;
    }

    if (classId) {
      // Verify class belongs to this school
      const classDoc = await Class.findOne({
        _id: classId,
        schoolId: req.schoolId,
      });
      if (!classDoc) {
        throw new AppError('Class not found', 404);
      }
      filter.classId = classId;
    }

    // Date range filter
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Aggregate attendance statistics
    const attendanceRecords = await Attendance.find(filter);

    // Calculate statistics
    const stats = {
      totalDays: attendanceRecords.length,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalStudentRecords: 0,
    };

    // Student-wise stats map
    const studentStatsMap = new Map();

    attendanceRecords.forEach((record) => {
      record.records.forEach((r) => {
        stats.totalStudentRecords += 1;

        switch (r.status) {
          case 'Present':
            stats.present += 1;
            break;
          case 'Absent':
            stats.absent += 1;
            break;
          case 'Late':
            stats.late += 1;
            break;
          case 'HalfDay':
            stats.halfDay += 1;
            break;
          default:
            break;
        }

        // Track per-student stats
        const studentIdStr = r.studentId.toString();
        if (!studentStatsMap.has(studentIdStr)) {
          studentStatsMap.set(studentIdStr, {
            studentId: r.studentId,
            present: 0,
            absent: 0,
            late: 0,
            halfDay: 0,
            totalDays: 0,
          });
        }
        const studentStat = studentStatsMap.get(studentIdStr);
        studentStat.totalDays += 1;
        switch (r.status) {
          case 'Present':
            studentStat.present += 1;
            break;
          case 'Absent':
            studentStat.absent += 1;
            break;
          case 'Late':
            studentStat.late += 1;
            break;
          case 'HalfDay':
            studentStat.halfDay += 1;
            break;
          default:
            break;
        }
      });
    });

    // Calculate percentages
    const overallPercentage = stats.totalStudentRecords > 0
      ? ((stats.present + stats.late + (stats.halfDay * 0.5)) / stats.totalStudentRecords * 100).toFixed(2)
      : 0;

    // Convert student stats map to array with percentages
    const studentStats = Array.from(studentStatsMap.values()).map((s) => ({
      ...s,
      attendancePercentage: s.totalDays > 0
        ? ((s.present + s.late + (s.halfDay * 0.5)) / s.totalDays * 100).toFixed(2)
        : 0,
    }));

    // Get student details
    const studentIds = studentStats.map((s) => s.studentId);
    const students = await User.find({ _id: { $in: studentIds } })
      .select('name admissionNumber');

    const studentsMap = new Map(students.map((s) => [s._id.toString(), s]));

    const enrichedStudentStats = studentStats.map((s) => ({
      ...s,
      studentName: studentsMap.get(s.studentId.toString())?.name || 'Unknown',
      admissionNumber: studentsMap.get(s.studentId.toString())?.admissionNumber || 'N/A',
    }));

    res.status(200).json({
      success: true,
      message: 'Attendance report generated successfully',
      data: {
        summary: {
          ...stats,
          overallAttendancePercentage: parseFloat(overallPercentage),
        },
        studentStats: enrichedStudentStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
