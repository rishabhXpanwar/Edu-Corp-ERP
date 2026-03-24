import React, { useEffect, useMemo, useRef } from 'react';
import { Bell, CalendarClock, ClipboardList, School } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments } from '../assignments/assignmentSlice.js';
import { fetchAttendanceReport } from '../attendance/attendanceSlice.js';
import { fetchExams } from '../exams/examSlice.js';
import { fetchNotifications, fetchUnreadCount } from '../notifications/notificationSlice.js';
import { fetchMyTimetable } from '../timetable/timetableSlice.js';
import StatsCard from '../../components/StatsCard.jsx';
import './TeacherDashboard.css';

const formatDate = (value) => {
  if (!value) {
    return 'Date not set';
  }
  return new Date(value).toLocaleDateString();
};

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const TeacherDashboard = ({ chartColors }) => {
  const dispatch = useDispatch();
  const requestFlags = useRef({
    timetable: false,
    assignments: false,
    attendance: false,
    exams: false,
    notifications: false,
    unreadCount: false,
  });

  const { user } = useSelector((state) => state.auth);
  const { schedule, loading: timetableLoading } = useSelector((state) => state.timetable);
  const { items: assignmentItems, loading: assignmentLoading } = useSelector((state) => state.assignment);
  const {
    report: attendanceReport,
    records: attendanceRecords,
    loading: attendanceLoading,
  } = useSelector((state) => state.attendance);
  const { items: examItems, loading: examLoading } = useSelector((state) => state.exam);
  const {
    notifications,
    unreadCount,
    loading: notificationLoading,
  } = useSelector((state) => state.notification);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const userClassId = typeof user?.classId === 'object' ? user.classId?._id : user?.classId;
  const userSectionId = typeof user?.sectionId === 'object' ? user.sectionId?._id : user?.sectionId;

  useEffect(() => {
    console.log('[TeacherDashboard] evaluating data dependencies');

    const hasSchedule = Array.isArray(schedule) && schedule.length > 0;
    if (!hasSchedule && !timetableLoading && !requestFlags.current.timetable) {
      requestFlags.current.timetable = true;
      dispatch(fetchMyTimetable());
    }

    if (
      userSectionId
      && !assignmentItems.length
      && !assignmentLoading
      && !requestFlags.current.assignments
    ) {
      requestFlags.current.assignments = true;
      dispatch(fetchAssignments(userSectionId));
    }

    const hasAttendanceRows = Array.isArray(attendanceReport)
      ? attendanceReport.length > 0
      : Array.isArray(attendanceReport?.studentStats) && attendanceReport.studentStats.length > 0;
    if (
      userClassId
      && userSectionId
      && !hasAttendanceRows
      && !attendanceLoading
      && !requestFlags.current.attendance
    ) {
      requestFlags.current.attendance = true;
      dispatch(fetchAttendanceReport({ classId: userClassId, sectionId: userSectionId, month, year }));
    }

    if (!examItems.length && !examLoading && !requestFlags.current.exams) {
      requestFlags.current.exams = true;
      dispatch(fetchExams({ status: 'upcoming', limit: 50 }));
    }

    if (!notifications.length && !notificationLoading && !requestFlags.current.notifications) {
      requestFlags.current.notifications = true;
      dispatch(fetchNotifications({ page: 1, limit: 20 }));
    }

    if (
      unreadCount === 0
      && !notificationLoading
      && !requestFlags.current.unreadCount
    ) {
      requestFlags.current.unreadCount = true;
      dispatch(fetchUnreadCount());
    }
  }, [
    assignmentItems.length,
    assignmentLoading,
    attendanceLoading,
    attendanceReport,
    dispatch,
    examItems.length,
    examLoading,
    month,
    notificationLoading,
    notifications.length,
    schedule,
    timetableLoading,
    unreadCount,
    userClassId,
    userSectionId,
    year,
  ]);

  const myClassesCount = useMemo(() => {
    const sections = new Set();
    (schedule || []).forEach((daySchedule) => {
      (daySchedule?.periods || []).forEach((period) => {
        if (!period) {
          return;
        }
        const sectionLabel = period.sectionName
          || period.sectionId?.name
          || period.classId?.name
          || period.subject;
        if (sectionLabel) {
          sections.add(sectionLabel);
        }
      });
    });
    return sections.size;
  }, [schedule]);

  const assignmentsCreatedCount = useMemo(() => {
    const mine = assignmentItems.filter((assignment) => {
      const teacherId = assignment.teacherId?._id || assignment.teacherId;
      return teacherId && String(teacherId) === String(user?._id);
    });
    return mine.length || assignmentItems.length;
  }, [assignmentItems, user?._id]);

  const attendanceMarkedToday = useMemo(() => {
    if (Array.isArray(attendanceRecords)) {
      if (attendanceRecords[0]?.records && Array.isArray(attendanceRecords[0].records)) {
        return attendanceRecords[0].records.length;
      }
      return attendanceRecords.length;
    }
    if (attendanceRecords?.records && Array.isArray(attendanceRecords.records)) {
      return attendanceRecords.records.length;
    }
    return 0;
  }, [attendanceRecords]);

  const attendanceBySectionData = useMemo(() => {
    if (Array.isArray(attendanceReport)) {
      const grouped = new Map();

      attendanceReport.forEach((entry) => {
        const sectionName = entry.studentId?.sectionId?.name || entry.sectionId?.name || 'Section';
        const current = grouped.get(sectionName) || { present: 0, total: 0 };
        const present = Number(entry.daysPresent ?? entry.present ?? 0);
        const total = Number(entry.totalDays ?? 0);
        current.present += present;
        current.total += total;
        grouped.set(sectionName, current);
      });

      return Array.from(grouped.entries()).map(([sectionName, values]) => ({
        sectionName,
        percentage: values.total > 0
          ? Number(((values.present / values.total) * 100).toFixed(2))
          : 0,
      }));
    }

    if (attendanceReport?.summary?.overallAttendancePercentage !== undefined) {
      return [{
        sectionName: 'Overall',
        percentage: Number(attendanceReport.summary.overallAttendancePercentage),
      }];
    }

    return [];
  }, [attendanceReport]);

  const assignmentStatusData = useMemo(() => {
    const nowTs = Date.now();
    const pendingDue = assignmentItems.filter((assignment) => {
      const due = toTimestamp(assignment.dueDate);
      return due === 0 || due >= nowTs;
    }).length;
    const pastDue = assignmentItems.length - pendingDue;

    return [
      { label: 'Pending Due', count: pendingDue, color: chartColors.warning },
      { label: 'Past Due', count: Math.max(0, pastDue), color: chartColors.danger },
    ];
  }, [assignmentItems, chartColors.danger, chartColors.warning]);

  const todaySchedule = useMemo(() => {
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const matchedDay = (schedule || []).find((daySchedule) => daySchedule.day === dayName);

    return [...(matchedDay?.periods || [])]
      .filter(Boolean)
      .sort((left, right) => String(left.startTime || '').localeCompare(String(right.startTime || '')));
  }, [now, schedule]);

  const upcomingExams = useMemo(() => {
    return [...examItems]
      .filter((exam) => toTimestamp(exam.startDate) >= Date.now())
      .sort((left, right) => toTimestamp(left.startDate) - toTimestamp(right.startDate))
      .slice(0, 5);
  }, [examItems]);

  return (
    <div className="dashboard-role teacher-dashboard">
      <header className="dashboard-role__header">
        <h1 className="dashboard-role__title">Teacher Dashboard</h1>
        <p className="dashboard-role__subtitle">Your classes, schedules, assignments, and classroom activity</p>
      </header>

      <section className="dashboard-role__stats">
        <StatsCard
          title="My Classes"
          value={myClassesCount}
          icon={<School size={20} />}
          accentColor={chartColors.primary}
        />
        <StatsCard
          title="Assignments Created"
          value={assignmentsCreatedCount}
          icon={<ClipboardList size={20} />}
          accentColor={chartColors.success}
        />
        <StatsCard
          title="Attendance Marked Today"
          value={attendanceMarkedToday}
          icon={<CalendarClock size={20} />}
          accentColor={chartColors.warning}
        />
        <StatsCard
          title="Unread Notifications"
          value={unreadCount}
          icon={<Bell size={20} />}
          accentColor={chartColors.danger}
        />
      </section>

      <section className="dashboard-role__charts">
        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Attendance by Section</h2>
              <p className="dashboard-card__subtitle">Current attendance percentage for assigned sections</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {attendanceBySectionData.length === 0 ? (
              <p className="dashboard-widget-list__empty">No attendance data available.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={attendanceBySectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sectionName" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                    <Bar dataKey="percentage" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Assignment Status</h2>
              <p className="dashboard-card__subtitle">Pending due vs past due assignments</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={assignmentStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {assignmentStatusData.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-role__widgets">
        <article className="dashboard-card dashboard-card--widget">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Today's Timetable</h2>
          </div>
          <ul className="dashboard-widget-list">
            {todaySchedule.length ? (
              todaySchedule.map((period, index) => (
                <li key={`${period.subject}-${index}`} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{period.subject || 'Class slot'}</span>
                    <span className="dashboard-widget-list__meta">
                      {period.startTime || '--'} - {period.endTime || '--'}
                    </span>
                  </div>
                  <span className="dashboard-chip dashboard-chip--info">
                    {period.sectionName || period.sectionId?.name || 'section'}
                  </span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No classes scheduled for today.</li>
            )}
          </ul>
        </article>

        <article className="dashboard-card dashboard-card--widget">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Upcoming Exams</h2>
          </div>
          <ul className="dashboard-widget-list">
            {upcomingExams.length ? (
              upcomingExams.map((exam) => (
                <li key={exam._id} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{exam.title || 'Exam'}</span>
                    <span className="dashboard-widget-list__meta">{formatDate(exam.startDate)}</span>
                  </div>
                  <span className="dashboard-chip dashboard-chip--warning">upcoming</span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No upcoming exams available.</li>
            )}
          </ul>
        </article>
      </section>
    </div>
  );
};

export default TeacherDashboard;
