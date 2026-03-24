import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendanceReport } from './attendanceSlice.js';
import AttendanceFilters from './AttendanceFilters.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const AttendanceReportView = () => {
  const dispatch = useDispatch();
  const { report, loading } = useSelector(state => state.attendance);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [filters, setFilters] = useState({ classId: '', sectionId: '', month: currentMonth, year: currentYear });

  useEffect(() => {
    if (filters.classId && filters.sectionId && filters.month && filters.year) {
      dispatch(fetchAttendanceReport(filters));
    }
  }, [dispatch, filters]);

  const calculatePercentage = (present, total) => {
    if (!total || total === 0) return 0;
    return Math.round((present / total) * 100);
  };

  return (
    <div className="attendance-report">
      <AttendanceFilters filters={filters} setFilters={setFilters} allowMonthYear={true} />

      {loading ? (
        <Spinner />
      ) : !filters.sectionId ? (
        <div className="placeholder-state">Please select a class and section to view the report.</div>
      ) : report.length === 0 ? (
        <EmptyState title="No Records" description="No attendance records found for this period." />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Admission No.</th>
                <th>Total Classes</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late / HalfDay</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {report.map(student => {
                const percentage = calculatePercentage(student.daysPresent, student.totalDays);
                const isLowAttendance = percentage < 75;

                return (
                  <tr key={student.studentId._id}>
                    <td>{student.studentId.name}</td>
                    <td>{student.studentId.admissionNumber}</td>
                    <td>{student.totalDays}</td>
                    <td>{student.daysPresent}</td>
                    <td>{student.daysAbsent}</td>
                    <td>{student.daysLate + student.daysHalfDay}</td>
                    <td>
                      <span className={`percentage-pill ${isLowAttendance ? 'warning' : 'good'}`}>
                        {percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceReportView;
