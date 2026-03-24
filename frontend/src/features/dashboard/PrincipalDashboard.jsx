import React, { useEffect, useMemo, useRef } from 'react';
import { GraduationCap, IndianRupee, UserCheck, Users } from 'lucide-react';
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
import { fetchFees } from '../fees/feeSlice.js';
import { fetchLeaveQueue } from '../leave/leaveSlice.js';
import { fetchStudents } from '../students/studentSlice.js';
import { fetchTeachers } from '../teachers/teacherSlice.js';
import StatsCard from '../../components/StatsCard.jsx';
import './PrincipalDashboard.css';

const formatDate = (value) => {
  if (!value) {
    return 'Date not set';
  }

  return new Date(value).toLocaleDateString();
};

const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const PrincipalDashboard = ({ chartColors }) => {
  const dispatch = useDispatch();
  const requestFlags = useRef({
    students: false,
    teachers: false,
    fees: false,
    leaveQueue: false,
    attendance: false,
    calendar: false,
    announcements: false,
  });

  const { students, pagination: studentPagination, loading: studentLoading } = useSelector((state) => state.students);
  const { teachers, pagination: teacherPagination, loading: teacherLoading } = useSelector((state) => state.teachers);
  const { items: feeItems, stats: feeStats, loading: feeLoading } = useSelector((state) => state.fee);
  const { queue: leaveQueue, loading: leaveLoading } = useSelector((state) => state.leave);
  const { report: attendanceReport, loading: attendanceLoading } = useSelector((state) => state.attendance);
  const { events: calendarEvents, loading: calendarLoading } = useSelector((state) => state.calendar);
  const { items: announcementItems, loading: announcementLoading } = useSelector((state) => state.announcement);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    console.log('[PrincipalDashboard] evaluating data dependencies');

    if (!students.length && !studentLoading && !requestFlags.current.students) {
      requestFlags.current.students = true;
      dispatch(fetchStudents({ page: 1, limit: 100 }));
    }

    if (!teachers.length && !teacherLoading && !requestFlags.current.teachers) {
      requestFlags.current.teachers = true;
      dispatch(fetchTeachers({ page: 1, limit: 100 }));
    }

    if (!feeItems.length && !feeLoading && !requestFlags.current.fees) {
      requestFlags.current.fees = true;
      dispatch(fetchFees({ page: 1, limit: 100 }));
    }

    if (!leaveQueue.length && !leaveLoading && !requestFlags.current.leaveQueue) {
      requestFlags.current.leaveQueue = true;
      dispatch(fetchLeaveQueue({ page: 1, limit: 50 }));
    }

    const hasAttendanceRows = Array.isArray(attendanceReport)
      ? attendanceReport.length > 0
      : Array.isArray(attendanceReport?.studentStats) && attendanceReport.studentStats.length > 0;
    if (!hasAttendanceRows && !attendanceLoading && !requestFlags.current.attendance) {
      requestFlags.current.attendance = true;
      dispatch(fetchAttendanceReport({ month, year }));
    }

    if (!calendarEvents.length && !calendarLoading && !requestFlags.current.calendar) {
      requestFlags.current.calendar = true;
      dispatch(fetchEvents({ month, year }));
    }

    if (!announcementItems.length && !announcementLoading && !requestFlags.current.announcements) {
      requestFlags.current.announcements = true;
      dispatch(fetchAnnouncements({ page: 1, limit: 6 }));
    }
  }, [
    announcementItems.length,
    announcementLoading,
    attendanceLoading,
    attendanceReport,
    calendarEvents.length,
    calendarLoading,
    dispatch,
    feeItems.length,
    feeLoading,
    leaveLoading,
    leaveQueue.length,
    month,
    studentLoading,
    studentPagination.total,
    students.length,
    teacherLoading,
    teacherPagination.total,
    teachers.length,
    year,
  ]);

  const studentsById = useMemo(() => {
    const map = new Map();
    students.forEach((student) => {
      map.set(student._id, student);
    });
    return map;
  }, [students]);

  const attendanceRows = useMemo(() => {
    if (Array.isArray(attendanceReport)) {
      return attendanceReport.map((entry) => ({
        studentId: entry.studentId?._id || entry.studentId,
        daysPresent: Number(entry.daysPresent ?? entry.present ?? 0),
        totalDays: Number(entry.totalDays ?? 0),
        className: entry.studentId?.classId?.name || entry.classId?.name || 'Unknown',
      }));
    }

    if (Array.isArray(attendanceReport?.studentStats)) {
      return attendanceReport.studentStats.map((entry) => {
        const studentId = entry.studentId?._id || entry.studentId;
        const student = studentsById.get(studentId);
        return {
          studentId,
          daysPresent: Number(entry.present ?? entry.daysPresent ?? 0),
          totalDays: Number(entry.totalDays ?? 0),
          className: student?.classId?.name || 'Unknown',
        };
      });
    }

    return [];
  }, [attendanceReport, studentsById]);

  const attendancePerClassData = useMemo(() => {
    const grouped = new Map();

    attendanceRows.forEach((entry) => {
      const className = entry.className || 'Unknown';
      if (!grouped.has(className)) {
        grouped.set(className, { present: 0, total: 0 });
      }
      const current = grouped.get(className);
      current.present += entry.daysPresent;
      current.total += entry.totalDays;
    });

    return Array.from(grouped.entries())
      .map(([className, values]) => ({
        className,
        percentage: values.total > 0
          ? Number(((values.present / values.total) * 100).toFixed(2))
          : 0,
      }))
      .sort((left, right) => right.percentage - left.percentage)
      .slice(0, 7);
  }, [attendanceRows]);

  const collectedAmount = useMemo(() => {
    if (typeof feeStats?.collected === 'number') {
      return feeStats.collected;
    }
    return feeItems
      .filter((item) => item.status === 'paid')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [feeItems, feeStats?.collected]);

  const outstandingAmount = useMemo(() => {
    if (typeof feeStats?.outstanding === 'number') {
      return feeStats.outstanding;
    }
    return feeItems
      .filter((item) => item.status !== 'paid')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [feeItems, feeStats?.outstanding]);

  const feeStatusData = useMemo(() => {
    return [
      { label: 'Collected', value: collectedAmount, color: chartColors.success },
      { label: 'Outstanding', value: outstandingAmount, color: chartColors.warning },
    ];
  }, [chartColors.success, chartColors.warning, collectedAmount, outstandingAmount]);

  const upcomingEvents = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const ordered = [...calendarEvents].sort(
      (left, right) => toTimestamp(left.startDate) - toTimestamp(right.startDate),
    );

    const upcoming = ordered.filter((event) => toTimestamp(event.startDate) >= startOfToday.getTime());
    return (upcoming.length > 0 ? upcoming : ordered).slice(0, 5);
  }, [calendarEvents]);

  const recentAnnouncements = useMemo(() => {
    return [...announcementItems]
      .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt))
      .slice(0, 3);
  }, [announcementItems]);

  const totalStudents = studentPagination?.total || students.length;
  const totalTeachers = teacherPagination?.total || teachers.length;

  return (
    <div className="dashboard-role principal-dashboard">
      <header className="dashboard-role__header">
        <h1 className="dashboard-role__title">Principal Dashboard</h1>
        <p className="dashboard-role__subtitle">School overview with academics, finance, and operations insights</p>
      </header>

      <section className="dashboard-role__stats">
        <StatsCard
          title="Total Students"
          value={totalStudents}
          icon={<Users size={20} />}
          accentColor={chartColors.primary}
        />
        <StatsCard
          title="Total Teachers"
          value={totalTeachers}
          icon={<GraduationCap size={20} />}
          accentColor={chartColors.success}
        />
        <StatsCard
          title="Fees Collected"
          value={formatCurrency(collectedAmount)}
          icon={<IndianRupee size={20} />}
          accentColor={chartColors.warning}
        />
        <StatsCard
          title="Pending Leave Requests"
          value={leaveQueue.length}
          icon={<UserCheck size={20} />}
          accentColor={chartColors.danger}
        />
      </section>

      <section className="dashboard-role__charts">
        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Attendance by Class</h2>
              <p className="dashboard-card__subtitle">Average attendance percentage by class</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {attendancePerClassData.length === 0 ? (
              <p className="dashboard-widget-list__empty">No attendance report data available yet.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={attendancePerClassData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
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
              <h2 className="dashboard-card__title">Fee Status</h2>
              <p className="dashboard-card__subtitle">Collected vs outstanding amount</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {collectedAmount === 0 && outstandingAmount === 0 ? (
              <p className="dashboard-widget-list__empty">No fee records available for charting.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={feeStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="label"
                      label
                    >
                      {feeStatusData.map((entry) => (
                        <Cell key={entry.label} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
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
            <h2 className="dashboard-card__title">Upcoming Calendar Events</h2>
          </div>
          <ul className="dashboard-widget-list">
            {upcomingEvents.length ? (
              upcomingEvents.map((event) => (
                <li key={event._id || event.title} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{event.title || 'Untitled event'}</span>
                    <span className="dashboard-widget-list__meta">{formatDate(event.startDate)}</span>
                  </div>
                  <span className="dashboard-chip dashboard-chip--info">{event.type || 'event'}</span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No upcoming events right now.</li>
            )}
          </ul>
        </article>

        <article className="dashboard-card dashboard-card--widget">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Recent Announcements</h2>
          </div>
          <ul className="dashboard-widget-list">
            {recentAnnouncements.length ? (
              recentAnnouncements.map((announcement) => (
                <li key={announcement._id || announcement.title} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{announcement.title || 'Untitled announcement'}</span>
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
      </section>
    </div>
  );
};

export default PrincipalDashboard;
