import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, BookCheck, CalendarCheck2, FileClock } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { fetchStudentResults } from '../results/resultSlice.js';
import { fetchMyTimetable } from '../timetable/timetableSlice.js';
import StatsCard from '../../components/StatsCard.jsx';
import './StudentDashboard.css';

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

const StudentDashboard = ({ chartColors }) => {
  const dispatch = useDispatch();
  const requestFlags = useRef({
    timetable: false,
    assignments: false,
    attendance: false,
    exams: false,
    notifications: false,
    unreadCount: false,
  });

  const [resultRequested, setResultRequested] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { schedule, loading: timetableLoading } = useSelector((state) => state.timetable);
  const { items: assignmentItems, loading: assignmentLoading } = useSelector((state) => state.assignment);
  const { report: attendanceReport, loading: attendanceLoading } = useSelector((state) => state.attendance);
  const { items: examItems, loading: examLoading } = useSelector((state) => state.exam);
  const {
    notifications,
    unreadCount,
    loading: notificationLoading,
  } = useSelector((state) => state.notification);
  const { studentResults } = useSelector((state) => state.result);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const studentId = user?._id;
  const classId = typeof user?.classId === 'object' ? user.classId?._id : user?.classId;
  const sectionId = typeof user?.sectionId === 'object' ? user.sectionId?._id : user?.sectionId;

  useEffect(() => {
    console.log('[StudentDashboard] evaluating data dependencies');

    const hasSchedule = Array.isArray(schedule) && schedule.length > 0;
    if (!hasSchedule && !timetableLoading && !requestFlags.current.timetable) {
      requestFlags.current.timetable = true;
      dispatch(fetchMyTimetable());
    }

    if (sectionId && !assignmentItems.length && !assignmentLoading && !requestFlags.current.assignments) {
      requestFlags.current.assignments = true;
      dispatch(fetchAssignments(sectionId));
    }

    const hasAttendanceRows = Array.isArray(attendanceReport)
      ? attendanceReport.length > 0
      : Array.isArray(attendanceReport?.studentStats) && attendanceReport.studentStats.length > 0;
    if (
      classId
      && sectionId
      && !hasAttendanceRows
      && !attendanceLoading
      && !requestFlags.current.attendance
    ) {
      requestFlags.current.attendance = true;
      dispatch(fetchAttendanceReport({ classId, sectionId, month, year }));
    }

    if (!examItems.length && !examLoading && !requestFlags.current.exams) {
      requestFlags.current.exams = true;
      dispatch(fetchExams({ limit: 50 }));
    }

    if (!notifications.length && !notificationLoading && !requestFlags.current.notifications) {
      requestFlags.current.notifications = true;
      dispatch(fetchNotifications({ page: 1, limit: 20 }));
    }

    if (unreadCount === 0 && !notificationLoading && !requestFlags.current.unreadCount) {
      requestFlags.current.unreadCount = true;
      dispatch(fetchUnreadCount());
    }
  }, [
    assignmentItems.length,
    assignmentLoading,
    attendanceLoading,
    attendanceReport,
    classId,
    dispatch,
    examItems.length,
    examLoading,
    month,
    notificationLoading,
    notifications.length,
    schedule,
    sectionId,
    timetableLoading,
    unreadCount,
    year,
  ]);

  useEffect(() => {
    if (!studentId || resultRequested || examItems.length === 0) {
      return;
    }

    const nowTs = Date.now();
    const sortedByDate = [...examItems].sort((left, right) => {
      const rightTs = toTimestamp(right.endDate || right.startDate);
      const leftTs = toTimestamp(left.endDate || left.startDate);
      return rightTs - leftTs;
    });
    const latestCompleted = sortedByDate.find((exam) => toTimestamp(exam.endDate || exam.startDate) <= nowTs);
    const targetExam = latestCompleted || sortedByDate[0];

    if (!targetExam?._id) {
      return;
    }

    setResultRequested(true);
    dispatch(fetchStudentResults({ studentId, examId: targetExam._id }));
  }, [dispatch, examItems, resultRequested, studentId]);

  const parsedStudentResult = useMemo(() => {
    if (Array.isArray(studentResults)) {
      return studentResults[0] || null;
    }
    return studentResults || null;
  }, [studentResults]);

  const studentAttendance = useMemo(() => {
    if (!studentId) {
      return null;
    }

    if (Array.isArray(attendanceReport)) {
      return attendanceReport.find((entry) => {
        const currentStudentId = entry.studentId?._id || entry.studentId;
        return String(currentStudentId) === String(studentId);
      }) || null;
    }

    if (Array.isArray(attendanceReport?.studentStats)) {
      return attendanceReport.studentStats.find((entry) => {
        const currentStudentId = entry.studentId?._id || entry.studentId;
        return String(currentStudentId) === String(studentId);
      }) || null;
    }

    return null;
  }, [attendanceReport, studentId]);

  const attendancePercentage = useMemo(() => {
    if (studentAttendance) {
      if (studentAttendance.attendancePercentage !== undefined) {
        return Number(studentAttendance.attendancePercentage) || 0;
      }

      const present = Number(studentAttendance.daysPresent ?? studentAttendance.present ?? 0);
      const total = Number(studentAttendance.totalDays ?? 0);
      return total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0;
    }

    if (attendanceReport?.summary?.overallAttendancePercentage !== undefined) {
      return Number(attendanceReport.summary.overallAttendancePercentage) || 0;
    }

    return 0;
  }, [attendanceReport?.summary?.overallAttendancePercentage, studentAttendance]);

  const upcomingExams = useMemo(() => {
    return [...examItems]
      .filter((exam) => toTimestamp(exam.startDate) >= Date.now())
      .sort((left, right) => toTimestamp(left.startDate) - toTimestamp(right.startDate));
  }, [examItems]);

  const upcomingAssignments = useMemo(() => {
    const nowTs = Date.now();
    return [...assignmentItems]
      .filter((assignment) => {
        const dueTs = toTimestamp(assignment.dueDate);
        return dueTs === 0 || dueTs >= nowTs;
      })
      .sort((left, right) => toTimestamp(left.dueDate) - toTimestamp(right.dueDate));
  }, [assignmentItems]);

  const subjectMarksData = useMemo(() => {
    return (parsedStudentResult?.subjects || []).map((subject) => ({
      subject: subject.subjectName || 'Subject',
      marks: Number(subject.obtainedMarks || 0),
    }));
  }, [parsedStudentResult?.subjects]);

  const attendanceDistributionData = useMemo(() => {
    if (!studentAttendance) {
      return [];
    }

    const present = Number(studentAttendance.daysPresent ?? studentAttendance.present ?? 0);
    const absent = Number(studentAttendance.daysAbsent ?? studentAttendance.absent ?? 0);
    const late = Number(studentAttendance.daysLate ?? studentAttendance.late ?? 0);
    const halfDay = Number(studentAttendance.daysHalfDay ?? studentAttendance.halfDay ?? 0);

    return [
      { label: 'Present', value: present },
      { label: 'Absent', value: absent },
      { label: 'Late/Half', value: late + halfDay },
    ];
  }, [studentAttendance]);

  const todaySchedule = useMemo(() => {
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const matchedDay = (schedule || []).find((daySchedule) => daySchedule.day === dayName);

    return [...(matchedDay?.periods || [])]
      .filter(Boolean)
      .sort((left, right) => String(left.startTime || '').localeCompare(String(right.startTime || '')));
  }, [now, schedule]);

  return (
    <div className="dashboard-role student-dashboard">
      <header className="dashboard-role__header">
        <h1 className="dashboard-role__title">Student Dashboard</h1>
        <p className="dashboard-role__subtitle">Personal performance, timetable, and upcoming academic tasks</p>
      </header>

      <section className="dashboard-role__stats">
        <StatsCard
          title="Attendance %"
          value={`${attendancePercentage}%`}
          icon={<CalendarCheck2 size={20} />}
          accentColor={chartColors.primary}
        />
        <StatsCard
          title="Upcoming Exams"
          value={upcomingExams.length}
          icon={<BookCheck size={20} />}
          accentColor={chartColors.success}
        />
        <StatsCard
          title="Assignments Due"
          value={upcomingAssignments.length}
          icon={<FileClock size={20} />}
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
              <h2 className="dashboard-card__title">Latest Subject-wise Marks</h2>
              <p className="dashboard-card__subtitle">Performance by subject in latest loaded exam</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {subjectMarksData.length === 0 ? (
              <p className="dashboard-widget-list__empty">No marks data available yet.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={subjectMarksData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="marks" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Monthly Attendance</h2>
              <p className="dashboard-card__subtitle">Attendance distribution for current report period</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {attendanceDistributionData.length === 0 ? (
              <p className="dashboard-widget-list__empty">No attendance data available yet.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={attendanceDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill={chartColors.success} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
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
                  <span className="dashboard-chip dashboard-chip--info">today</span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No classes scheduled for today.</li>
            )}
          </ul>
        </article>

        <article className="dashboard-card dashboard-card--widget">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Upcoming Assignments</h2>
          </div>
          <ul className="dashboard-widget-list">
            {upcomingAssignments.length ? (
              upcomingAssignments.slice(0, 3).map((assignment) => (
                <li key={assignment._id} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{assignment.title || 'Assignment'}</span>
                    <span className="dashboard-widget-list__meta">Due {formatDate(assignment.dueDate)}</span>
                  </div>
                  <span className="dashboard-chip dashboard-chip--warning">due</span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No upcoming assignments.</li>
            )}
          </ul>
        </article>
      </section>
    </div>
  );
};

export default StudentDashboard;
