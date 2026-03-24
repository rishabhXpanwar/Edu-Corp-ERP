import React, { useEffect, useMemo, useRef } from 'react';
import { BookOpen, ClipboardCheck, FileChartColumnIncreasing, NotepadText } from 'lucide-react';
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
import { fetchClasses } from '../classes/classSlice.js';
import { fetchExams } from '../exams/examSlice.js';
import StatsCard from '../../components/StatsCard.jsx';
import './AcademicManagerDashboard.css';

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

const AcademicManagerDashboard = ({ chartColors }) => {
  const dispatch = useDispatch();
  const requestFlags = useRef({
    exams: false,
    classes: false,
    assignments: false,
    attendance: false,
  });

  const { items: examItems, loading: examLoading } = useSelector((state) => state.exam);
  const { classes, loading: classLoading } = useSelector((state) => state.classes);
  const { items: assignmentItems, loading: assignmentLoading } = useSelector((state) => state.assignment);
  const { report: attendanceReport, loading: attendanceLoading } = useSelector((state) => state.attendance);
  const { sectionMarks } = useSelector((state) => state.marks);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const firstSectionId = useMemo(() => {
    for (let index = 0; index < classes.length; index += 1) {
      const section = classes[index]?.sections?.[0];
      if (section?._id) {
        return section._id;
      }
    }
    return '';
  }, [classes]);

  useEffect(() => {
    console.log('[AcademicManagerDashboard] evaluating data dependencies');

    if (!examItems.length && !examLoading && !requestFlags.current.exams) {
      requestFlags.current.exams = true;
      dispatch(fetchExams({ limit: 100 }));
    }

    if (!classes.length && !classLoading && !requestFlags.current.classes) {
      requestFlags.current.classes = true;
      dispatch(fetchClasses());
    }

    if (
      firstSectionId
      && !assignmentItems.length
      && !assignmentLoading
      && !requestFlags.current.assignments
    ) {
      requestFlags.current.assignments = true;
      dispatch(fetchAssignments(firstSectionId));
    }

    const hasAttendanceRows = Array.isArray(attendanceReport)
      ? attendanceReport.length > 0
      : Array.isArray(attendanceReport?.studentStats) && attendanceReport.studentStats.length > 0;
    if (!hasAttendanceRows && !attendanceLoading && !requestFlags.current.attendance) {
      requestFlags.current.attendance = true;
      dispatch(fetchAttendanceReport({ month, year }));
    }
  }, [
    assignmentItems.length,
    assignmentLoading,
    attendanceLoading,
    attendanceReport,
    classLoading,
    classes.length,
    dispatch,
    examItems.length,
    examLoading,
    firstSectionId,
    month,
    year,
  ]);

  const sectionAttendanceData = useMemo(() => {
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

      return Array.from(grouped.entries())
        .map(([sectionName, values]) => ({
          sectionName,
          percentage: values.total > 0
            ? Number(((values.present / values.total) * 100).toFixed(2))
            : 0,
        }))
        .slice(0, 8);
    }

    if (attendanceReport?.summary?.overallAttendancePercentage !== undefined) {
      return [{
        sectionName: 'Overall',
        percentage: Number(attendanceReport.summary.overallAttendancePercentage),
      }];
    }

    return [];
  }, [attendanceReport]);

  const examResultsOverviewData = useMemo(() => {
    let pass = 0;
    let fail = 0;

    sectionMarks.forEach((record) => {
      const subjects = record.subjects || [];
      if (!subjects.length) {
        return;
      }

      const obtainedTotal = subjects.reduce(
        (sum, subject) => sum + Number(subject.obtainedMarks || 0),
        0,
      );
      const maxTotal = subjects.reduce(
        (sum, subject) => sum + Number(subject.totalMarks || 0),
        0,
      );

      const percentage = maxTotal > 0 ? (obtainedTotal / maxTotal) * 100 : 0;
      if (percentage >= 40) {
        pass += 1;
      } else {
        fail += 1;
      }
    });

    return [
      { label: 'Pass', count: pass, color: chartColors.success },
      { label: 'Fail', count: fail, color: chartColors.danger },
    ];
  }, [chartColors.danger, chartColors.success, sectionMarks]);

  const upcomingExams = useMemo(() => {
    return [...examItems]
      .filter((exam) => toTimestamp(exam.startDate) >= Date.now())
      .sort((left, right) => toTimestamp(left.startDate) - toTimestamp(right.startDate));
  }, [examItems]);

  const recentAssignments = useMemo(() => {
    return [...assignmentItems]
      .sort((left, right) => {
        const rightDate = toTimestamp(right.createdAt || right.dueDate);
        const leftDate = toTimestamp(left.createdAt || left.dueDate);
        return rightDate - leftDate;
      })
      .slice(0, 5);
  }, [assignmentItems]);

  const totalExams = examItems.length;
  const publishedResults = sectionMarks.filter((record) => record.status === 'published').length;
  const upcomingExamsCount = upcomingExams.length;
  const totalAssignments = assignmentItems.length;

  return (
    <div className="dashboard-role academic-manager-dashboard">
      <header className="dashboard-role__header">
        <h1 className="dashboard-role__title">Academic Manager Dashboard</h1>
        <p className="dashboard-role__subtitle">Exams, outcomes, assignments, and attendance trends</p>
      </header>

      <section className="dashboard-role__stats">
        <StatsCard
          title="Total Exams"
          value={totalExams}
          icon={<BookOpen size={20} />}
          accentColor={chartColors.primary}
        />
        <StatsCard
          title="Published Results"
          value={publishedResults}
          icon={<ClipboardCheck size={20} />}
          accentColor={chartColors.success}
        />
        <StatsCard
          title="Upcoming Exams"
          value={upcomingExamsCount}
          icon={<FileChartColumnIncreasing size={20} />}
          accentColor={chartColors.warning}
        />
        <StatsCard
          title="Total Assignments"
          value={totalAssignments}
          icon={<NotepadText size={20} />}
          accentColor={chartColors.danger}
        />
      </section>

      <section className="dashboard-role__charts">
        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Section-wise Attendance</h2>
              <p className="dashboard-card__subtitle">Attendance percentage by section</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {sectionAttendanceData.length === 0 ? (
              <p className="dashboard-widget-list__empty">No attendance report data to display.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sectionAttendanceData}>
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
              <h2 className="dashboard-card__title">Exam Results Overview</h2>
              <p className="dashboard-card__subtitle">Pass and fail split from loaded marks</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={examResultsOverviewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {examResultsOverviewData.map((entry) => (
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
            <h2 className="dashboard-card__title">Upcoming Exams</h2>
          </div>
          <ul className="dashboard-widget-list">
            {upcomingExams.length ? (
              upcomingExams.slice(0, 5).map((exam) => (
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

        <article className="dashboard-card dashboard-card--widget">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Recent Assignments</h2>
          </div>
          <ul className="dashboard-widget-list">
            {recentAssignments.length ? (
              recentAssignments.map((assignment) => (
                <li key={assignment._id} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{assignment.title || 'Assignment'}</span>
                    <span className="dashboard-widget-list__meta">
                      Due {formatDate(assignment.dueDate)}
                    </span>
                  </div>
                  <span className="dashboard-chip dashboard-chip--info">{assignment.subject || 'General'}</span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No assignments available.</li>
            )}
          </ul>
        </article>
      </section>
    </div>
  );
};

export default AcademicManagerDashboard;
