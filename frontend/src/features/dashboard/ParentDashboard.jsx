import React, { useEffect, useMemo, useRef } from 'react';
import { Bell, CalendarClock, CreditCard, Percent } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnnouncements } from '../announcements/announcementSlice.js';
import { fetchAttendanceReport } from '../attendance/attendanceSlice.js';
import { fetchEvents } from '../calendar/calendarSlice.js';
import { fetchExams } from '../exams/examSlice.js';
import { fetchStudentFees } from '../fees/feeSlice.js';
import { fetchUnreadCount } from '../notifications/notificationSlice.js';
import { fetchStudentById } from '../students/studentSlice.js';
import StatsCard from '../../components/StatsCard.jsx';
import './ParentDashboard.css';

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

const ParentDashboard = ({ chartColors }) => {
  const dispatch = useDispatch();
  const requestFlags = useRef({
    childProfile: false,
    childFees: false,
    announcements: false,
    calendar: false,
    exams: false,
    unreadCount: false,
    attendance: false,
  });

  const { user } = useSelector((state) => state.auth);
  const { selectedStudent, loading: studentLoading } = useSelector((state) => state.students);
  const { studentFees, loading: feeLoading } = useSelector((state) => state.fee);
  const { items: announcementItems, loading: announcementLoading } = useSelector((state) => state.announcement);
  const { events: calendarEvents, loading: calendarLoading } = useSelector((state) => state.calendar);
  const { items: examItems, loading: examLoading } = useSelector((state) => state.exam);
  const { unreadCount, loading: notificationLoading } = useSelector((state) => state.notification);
  const { report: attendanceReport, loading: attendanceLoading } = useSelector((state) => state.attendance);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const childId = useMemo(() => {
    const firstChild = user?.studentIds?.[0];
    if (!firstChild) {
      return '';
    }
    return typeof firstChild === 'object' ? firstChild._id : firstChild;
  }, [user?.studentIds]);

  const loadedChildId = selectedStudent?.student?._id;
  const childClassId = selectedStudent?.student?.classId?._id || selectedStudent?.student?.classId;
  const childSectionId = selectedStudent?.student?.sectionId?._id || selectedStudent?.student?.sectionId;

  useEffect(() => {
    console.log('[ParentDashboard] evaluating data dependencies');

    if (
      childId
      && childId !== loadedChildId
      && !studentLoading
      && !requestFlags.current.childProfile
    ) {
      requestFlags.current.childProfile = true;
      dispatch(fetchStudentById(childId));
    }

    if (childId && !studentFees.length && !feeLoading && !requestFlags.current.childFees) {
      requestFlags.current.childFees = true;
      dispatch(fetchStudentFees(childId));
    }

    if (!announcementItems.length && !announcementLoading && !requestFlags.current.announcements) {
      requestFlags.current.announcements = true;
      dispatch(fetchAnnouncements({ page: 1, limit: 6 }));
    }

    if (!calendarEvents.length && !calendarLoading && !requestFlags.current.calendar) {
      requestFlags.current.calendar = true;
      dispatch(fetchEvents({ month, year }));
    }

    if (!examItems.length && !examLoading && !requestFlags.current.exams) {
      requestFlags.current.exams = true;
      dispatch(fetchExams({ status: 'upcoming', limit: 20 }));
    }

    if (unreadCount === 0 && !notificationLoading && !requestFlags.current.unreadCount) {
      requestFlags.current.unreadCount = true;
      dispatch(fetchUnreadCount());
    }

    const hasAttendanceRows = Array.isArray(attendanceReport)
      ? attendanceReport.length > 0
      : Array.isArray(attendanceReport?.studentStats) && attendanceReport.studentStats.length > 0;
    if (
      childClassId
      && childSectionId
      && !hasAttendanceRows
      && !attendanceLoading
      && !requestFlags.current.attendance
    ) {
      requestFlags.current.attendance = true;
      dispatch(fetchAttendanceReport({ classId: childClassId, sectionId: childSectionId, month, year }));
    }
  }, [
    announcementItems.length,
    announcementLoading,
    attendanceLoading,
    attendanceReport,
    calendarEvents.length,
    calendarLoading,
    childClassId,
    childId,
    childSectionId,
    dispatch,
    examItems.length,
    examLoading,
    feeLoading,
    loadedChildId,
    month,
    notificationLoading,
    studentFees.length,
    studentLoading,
    unreadCount,
    year,
  ]);

  const childAttendance = useMemo(() => {
    if (!childId) {
      return null;
    }

    if (Array.isArray(attendanceReport)) {
      return attendanceReport.find((entry) => {
        const currentStudentId = entry.studentId?._id || entry.studentId;
        return String(currentStudentId) === String(childId);
      }) || null;
    }

    if (Array.isArray(attendanceReport?.studentStats)) {
      return attendanceReport.studentStats.find((entry) => {
        const currentStudentId = entry.studentId?._id || entry.studentId;
        return String(currentStudentId) === String(childId);
      }) || null;
    }

    return null;
  }, [attendanceReport, childId]);

  const attendancePercentage = useMemo(() => {
    if (childAttendance) {
      if (childAttendance.attendancePercentage !== undefined) {
        return Number(childAttendance.attendancePercentage) || 0;
      }

      const present = Number(childAttendance.daysPresent ?? childAttendance.present ?? 0);
      const total = Number(childAttendance.totalDays ?? 0);
      return total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0;
    }

    if (attendanceReport?.summary?.overallAttendancePercentage !== undefined) {
      return Number(attendanceReport.summary.overallAttendancePercentage) || 0;
    }

    return 0;
  }, [attendanceReport?.summary?.overallAttendancePercentage, childAttendance]);

  const upcomingExams = useMemo(() => {
    return [...examItems]
      .filter((exam) => toTimestamp(exam.startDate) >= Date.now())
      .sort((left, right) => toTimestamp(left.startDate) - toTimestamp(right.startDate));
  }, [examItems]);

  const paidFeesCount = useMemo(() => {
    return studentFees.filter((fee) => fee.status === 'paid').length;
  }, [studentFees]);

  const pendingFeesCount = useMemo(() => {
    return studentFees.filter((fee) => fee.status !== 'paid').length;
  }, [studentFees]);

  const feeStatusData = useMemo(() => {
    return [
      { label: 'Paid', value: paidFeesCount, color: chartColors.success },
      { label: 'Pending', value: pendingFeesCount, color: chartColors.warning },
    ];
  }, [chartColors.success, chartColors.warning, paidFeesCount, pendingFeesCount]);

  const attendanceDistributionData = useMemo(() => {
    if (!childAttendance) {
      return [];
    }

    const present = Number(childAttendance.daysPresent ?? childAttendance.present ?? 0);
    const absent = Number(childAttendance.daysAbsent ?? childAttendance.absent ?? 0);
    const late = Number(childAttendance.daysLate ?? childAttendance.late ?? 0);
    const halfDay = Number(childAttendance.daysHalfDay ?? childAttendance.halfDay ?? 0);

    return [
      { label: 'Present', value: present },
      { label: 'Absent', value: absent },
      { label: 'Late/Half', value: late + halfDay },
    ];
  }, [childAttendance]);

  const latestAnnouncements = useMemo(() => {
    return [...announcementItems]
      .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt))
      .slice(0, 3);
  }, [announcementItems]);

  const upcomingEvents = useMemo(() => {
    const ordered = [...calendarEvents].sort(
      (left, right) => toTimestamp(left.startDate) - toTimestamp(right.startDate),
    );
    const fromNow = ordered.filter((event) => toTimestamp(event.startDate) >= Date.now());
    return (fromNow.length ? fromNow : ordered).slice(0, 5);
  }, [calendarEvents]);

  const feeStatusLabel = pendingFeesCount > 0 ? `Pending (${pendingFeesCount})` : 'Paid';

  return (
    <div className="dashboard-role parent-dashboard">
      <header className="dashboard-role__header">
        <h1 className="dashboard-role__title">Parent Dashboard</h1>
        <p className="dashboard-role__subtitle">Child progress, fees, announcements, and school schedule updates</p>
      </header>

      <section className="dashboard-role__stats">
        <StatsCard
          title="Child Attendance %"
          value={`${attendancePercentage}%`}
          icon={<Percent size={20} />}
          accentColor={chartColors.primary}
        />
        <StatsCard
          title="Upcoming Exams"
          value={upcomingExams.length}
          icon={<CalendarClock size={20} />}
          accentColor={chartColors.success}
        />
        <StatsCard
          title="Fee Status"
          value={feeStatusLabel}
          icon={<CreditCard size={20} />}
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
              <h2 className="dashboard-card__title">Monthly Attendance</h2>
              <p className="dashboard-card__subtitle">Child attendance distribution for current month</p>
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
                    <Bar dataKey="value" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Fee Payment Status</h2>
              <p className="dashboard-card__subtitle">Paid vs pending fee records for child</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {studentFees.length === 0 ? (
              <p className="dashboard-widget-list__empty">No fee records available for charting.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={feeStatusData}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={50}
                      outerRadius={80}
                      cx="50%"
                      cy="50%"
                      label
                    >
                      {feeStatusData.map((entry) => (
                        <Cell key={entry.label} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-role__widgets">
        <article className="dashboard-card dashboard-card--widget">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Latest Announcements</h2>
          </div>
          <ul className="dashboard-widget-list">
            {latestAnnouncements.length ? (
              latestAnnouncements.map((announcement) => (
                <li key={announcement._id} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{announcement.title || 'Announcement'}</span>
                    <span className="dashboard-widget-list__meta">{formatDate(announcement.createdAt)}</span>
                  </div>
                  <span className="dashboard-chip dashboard-chip--success">new</span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No announcements posted yet.</li>
            )}
          </ul>
        </article>

        <article className="dashboard-card dashboard-card--widget">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Upcoming Calendar Events</h2>
          </div>
          <ul className="dashboard-widget-list">
            {upcomingEvents.length ? (
              upcomingEvents.map((event) => (
                <li key={event._id} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{event.title || 'Event'}</span>
                    <span className="dashboard-widget-list__meta">{formatDate(event.startDate)}</span>
                  </div>
                  <span className="dashboard-chip dashboard-chip--info">{event.type || 'event'}</span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No upcoming events scheduled.</li>
            )}
          </ul>
        </article>
      </section>
    </div>
  );
};

export default ParentDashboard;
