import React, { useEffect, useMemo, useRef } from 'react';
import { Briefcase, ClipboardCheck, Users, UserSquare2 } from 'lucide-react';
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
import { fetchLeaveQueue } from '../leave/leaveSlice.js';
import { fetchManagers } from '../managers/managerSlice.js';
import { fetchTeachers } from '../teachers/teacherSlice.js';
import StatsCard from '../../components/StatsCard.jsx';
import './HrManagerDashboard.css';

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

const HrManagerDashboard = ({ chartColors }) => {
  const dispatch = useDispatch();
  const requestFlags = useRef({ teachers: false, managers: false, leaveQueue: false });

  const { teachers, pagination: teacherPagination, loading: teacherLoading } = useSelector((state) => state.teachers);
  const { managers, pagination: managerPagination, loading: managerLoading } = useSelector((state) => state.managers);
  const { queue: leaveQueue, loading: leaveLoading } = useSelector((state) => state.leave);

  useEffect(() => {
    console.log('[HrManagerDashboard] evaluating data dependencies');

    if (!teachers.length && !teacherLoading && !requestFlags.current.teachers) {
      requestFlags.current.teachers = true;
      dispatch(fetchTeachers({ page: 1, limit: 100 }));
    }

    if (!managers.length && !managerLoading && !requestFlags.current.managers) {
      requestFlags.current.managers = true;
      dispatch(fetchManagers({ page: 1, limit: 100 }));
    }

    if (!leaveQueue.length && !leaveLoading && !requestFlags.current.leaveQueue) {
      requestFlags.current.leaveQueue = true;
      dispatch(fetchLeaveQueue({ page: 1, limit: 100 }));
    }
  }, [
    dispatch,
    leaveLoading,
    leaveQueue.length,
    managerLoading,
    managers.length,
    teacherLoading,
    teachers.length,
  ]);

  const totalTeachers = teacherPagination?.total || teachers.length;
  const totalManagers = managerPagination?.total || managers.length;
  const pendingLeaveCount = leaveQueue.filter((request) => request.status === 'pending').length;
  const activeStaffCount = [...teachers, ...managers].filter((staff) => staff.isActive !== false).length;

  const leaveStatusData = useMemo(() => {
    const summary = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    leaveQueue.forEach((request) => {
      const status = request.status || 'pending';
      if (summary[status] === undefined) {
        summary.pending += 1;
        return;
      }
      summary[status] += 1;
    });

    return [
      { label: 'Pending', count: summary.pending, color: chartColors.warning },
      { label: 'Approved', count: summary.approved, color: chartColors.success },
      { label: 'Rejected', count: summary.rejected, color: chartColors.danger },
    ];
  }, [chartColors.danger, chartColors.success, chartColors.warning, leaveQueue]);

  const teachersByDepartmentData = useMemo(() => {
    const grouped = new Map();

    teachers.forEach((teacher) => {
      const department = teacher.designation || 'General';
      const current = grouped.get(department) || 0;
      grouped.set(department, current + 1);
    });

    return Array.from(grouped.entries())
      .map(([department, count]) => ({ department, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6);
  }, [teachers]);

  const pendingLeaveQueue = useMemo(() => {
    return leaveQueue
      .filter((request) => request.status === 'pending')
      .sort((left, right) => toTimestamp(left.startDate) - toTimestamp(right.startDate))
      .slice(0, 5);
  }, [leaveQueue]);

  const recentlyAddedTeachers = useMemo(() => {
    return [...teachers]
      .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt))
      .slice(0, 5);
  }, [teachers]);

  return (
    <div className="dashboard-role hr-manager-dashboard">
      <header className="dashboard-role__header">
        <h1 className="dashboard-role__title">HR Manager Dashboard</h1>
        <p className="dashboard-role__subtitle">Staff activity, leave flow, and workforce distribution</p>
      </header>

      <section className="dashboard-role__stats">
        <StatsCard
          title="Total Teachers"
          value={totalTeachers}
          icon={<Users size={20} />}
          accentColor={chartColors.primary}
        />
        <StatsCard
          title="Total Managers"
          value={totalManagers}
          icon={<Briefcase size={20} />}
          accentColor={chartColors.success}
        />
        <StatsCard
          title="Pending Leave"
          value={pendingLeaveCount}
          icon={<ClipboardCheck size={20} />}
          accentColor={chartColors.warning}
        />
        <StatsCard
          title="Active Staff"
          value={activeStaffCount}
          icon={<UserSquare2 size={20} />}
          accentColor={chartColors.danger}
        />
      </section>

      <section className="dashboard-role__charts">
        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Leave Requests by Status</h2>
              <p className="dashboard-card__subtitle">Current review pipeline snapshot</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {leaveQueue.length === 0 ? (
              <p className="dashboard-widget-list__empty">No leave requests available yet.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={leaveStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {leaveStatusData.map((entry) => (
                        <Cell key={entry.label} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Teachers by Designation</h2>
              <p className="dashboard-card__subtitle">Distribution across departments</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {teachersByDepartmentData.length === 0 ? (
              <p className="dashboard-widget-list__empty">No teacher data available for charting.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={teachersByDepartmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
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
            <h2 className="dashboard-card__title">Pending Leave Queue</h2>
          </div>
          <ul className="dashboard-widget-list">
            {pendingLeaveQueue.length ? (
              pendingLeaveQueue.map((request) => (
                <li key={request._id} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{request.applicantId?.name || 'Staff member'}</span>
                    <span className="dashboard-widget-list__meta">
                      {request.type || 'Leave'} - {formatDate(request.startDate)}
                    </span>
                  </div>
                  <span className="dashboard-chip dashboard-chip--warning">pending</span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No pending leave requests.</li>
            )}
          </ul>
        </article>

        <article className="dashboard-card dashboard-card--widget">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Recently Added Teachers</h2>
          </div>
          <ul className="dashboard-widget-list">
            {recentlyAddedTeachers.length ? (
              recentlyAddedTeachers.map((teacher) => (
                <li key={teacher._id} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{teacher.name || 'Teacher'}</span>
                    <span className="dashboard-widget-list__meta">{teacher.designation || 'General'}</span>
                  </div>
                  <span className="dashboard-chip dashboard-chip--info">{formatDate(teacher.createdAt)}</span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No teacher records available yet.</li>
            )}
          </ul>
        </article>
      </section>
    </div>
  );
};

export default HrManagerDashboard;
