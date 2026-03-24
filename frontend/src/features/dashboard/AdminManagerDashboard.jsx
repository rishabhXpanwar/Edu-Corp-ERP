import React, { useEffect, useMemo, useRef } from 'react';
import { Bus, Clock3, LibraryBig, Users } from 'lucide-react';
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
import { fetchEvents } from '../calendar/calendarSlice.js';
import { fetchBooks } from '../library/librarySlice.js';
import { fetchLeaveQueue } from '../leave/leaveSlice.js';
import { fetchStudents } from '../students/studentSlice.js';
import { fetchTransports } from '../transport/transportSlice.js';
import StatsCard from '../../components/StatsCard.jsx';
import './AdminManagerDashboard.css';

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

const AdminManagerDashboard = ({ chartColors }) => {
  const dispatch = useDispatch();
  const requestFlags = useRef({
    students: false,
    transports: false,
    books: false,
    leaveQueue: false,
    calendar: false,
  });

  const { students, pagination: studentPagination, loading: studentLoading } = useSelector((state) => state.students);
  const { items: transports, loading: transportLoading } = useSelector((state) => state.transport);
  const { items: books, pagination: libraryPagination, loading: libraryLoading } = useSelector((state) => state.library);
  const { queue: leaveQueue, loading: leaveLoading } = useSelector((state) => state.leave);
  const { events: calendarEvents, loading: calendarLoading } = useSelector((state) => state.calendar);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    console.log('[AdminManagerDashboard] evaluating data dependencies');

    if (!students.length && !studentLoading && !requestFlags.current.students) {
      requestFlags.current.students = true;
      dispatch(fetchStudents({ page: 1, limit: 100 }));
    }

    if (!transports.length && !transportLoading && !requestFlags.current.transports) {
      requestFlags.current.transports = true;
      dispatch(fetchTransports());
    }

    if (!books.length && !libraryLoading && !requestFlags.current.books) {
      requestFlags.current.books = true;
      dispatch(fetchBooks({ page: 1, limit: 100 }));
    }

    if (!leaveQueue.length && !leaveLoading && !requestFlags.current.leaveQueue) {
      requestFlags.current.leaveQueue = true;
      dispatch(fetchLeaveQueue({ page: 1, limit: 100, status: 'pending' }));
    }

    if (!calendarEvents.length && !calendarLoading && !requestFlags.current.calendar) {
      requestFlags.current.calendar = true;
      dispatch(fetchEvents({ month, year }));
    }
  }, [
    books.length,
    calendarEvents.length,
    calendarLoading,
    dispatch,
    leaveLoading,
    leaveQueue.length,
    libraryLoading,
    month,
    studentLoading,
    students.length,
    transportLoading,
    transports.length,
    year,
  ]);

  const totalStudents = studentPagination?.total || students.length;
  const transportRoutes = transports.length;
  const libraryBooks = libraryPagination?.total || books.length;
  const pendingAdminLeave = leaveQueue.filter((request) => request.status === 'pending').length;

  const enrollmentByClassData = useMemo(() => {
    const grouped = new Map();

    students.forEach((student) => {
      const className = student.classId?.name || 'Unassigned';
      grouped.set(className, (grouped.get(className) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([className, count]) => ({ className, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 8);
  }, [students]);

  const transportAssignmentData = useMemo(() => {
    const assignedStudentIds = new Set();

    transports.forEach((route) => {
      (route.assignedStudents || []).forEach((assignedStudent) => {
        const studentId = assignedStudent?._id || assignedStudent?.id || assignedStudent;
        if (studentId) {
          assignedStudentIds.add(String(studentId));
        }
      });
    });

    const assigned = assignedStudentIds.size;
    const unassigned = Math.max(0, totalStudents - assigned);

    return [
      { label: 'Assigned', value: assigned, color: chartColors.success },
      { label: 'Not Assigned', value: unassigned, color: chartColors.warning },
    ];
  }, [chartColors.success, chartColors.warning, totalStudents, transports]);

  const thisWeekEvents = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return [...calendarEvents]
      .filter((event) => {
        const eventDateTs = toTimestamp(event.startDate);
        return eventDateTs >= start.getTime() && eventDateTs <= end.getTime();
      })
      .sort((left, right) => toTimestamp(left.startDate) - toTimestamp(right.startDate))
      .slice(0, 5);
  }, [calendarEvents]);

  return (
    <div className="dashboard-role admin-manager-dashboard">
      <header className="dashboard-role__header">
        <h1 className="dashboard-role__title">Admin Manager Dashboard</h1>
        <p className="dashboard-role__subtitle">Operational visibility across students, transport, and library</p>
      </header>

      <section className="dashboard-role__stats">
        <StatsCard
          title="Total Students"
          value={totalStudents}
          icon={<Users size={20} />}
          accentColor={chartColors.primary}
        />
        <StatsCard
          title="Transport Routes"
          value={transportRoutes}
          icon={<Bus size={20} />}
          accentColor={chartColors.success}
        />
        <StatsCard
          title="Library Books"
          value={libraryBooks}
          icon={<LibraryBig size={20} />}
          accentColor={chartColors.warning}
        />
        <StatsCard
          title="Pending Admin Leave"
          value={pendingAdminLeave}
          icon={<Clock3 size={20} />}
          accentColor={chartColors.danger}
        />
      </section>

      <section className="dashboard-role__charts">
        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Student Enrollment by Class</h2>
              <p className="dashboard-card__subtitle">Class-wise student distribution</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {enrollmentByClassData.length === 0 ? (
              <p className="dashboard-widget-list__empty">No student records available for charting.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={enrollmentByClassData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Transport Assignment</h2>
              <p className="dashboard-card__subtitle">Assigned vs not assigned students</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {totalStudents === 0 ? (
              <p className="dashboard-widget-list__empty">No student data available for transport chart.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={transportAssignmentData}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={50}
                      outerRadius={80}
                      cx="50%"
                      cy="50%"
                      label
                    >
                      {transportAssignmentData.map((entry) => (
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
            <h2 className="dashboard-card__title">Calendar Events This Week</h2>
          </div>
          <ul className="dashboard-widget-list">
            {thisWeekEvents.length ? (
              thisWeekEvents.map((event) => (
                <li key={event._id} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{event.title || 'Event'}</span>
                    <span className="dashboard-widget-list__meta">{formatDate(event.startDate)}</span>
                  </div>
                  <span className="dashboard-chip dashboard-chip--info">{event.type || 'event'}</span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No events scheduled for this week.</li>
            )}
          </ul>
        </article>

        <article className="dashboard-card dashboard-card--widget">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Recent Audit Activity</h2>
          </div>
          <div className="dashboard-widget-list__empty">
            Audit Log (coming soon)
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminManagerDashboard;
