import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AttendanceMarkingGrid from './AttendanceMarkingGrid.jsx';
import AttendanceReportView from './AttendanceReportView.jsx';
import './AttendancePage.css';

const AttendancePage = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Default to report for principal/managers, marking for teachers
  const [activeTab, setActiveTab] = useState(
    ['principal', 'academicManager', 'adminManager'].includes(user?.role) ? 'report' : 'mark'
  );

  return (
    <div className="attendance-page">
      <div className="attendance-page__header">
        <h1>Attendance Management</h1>
      </div>

      <div className="attendance-page__tabs">
        {['teacher', 'principal', 'academicManager', 'adminManager'].includes(user?.role) && (
          <button 
            className={`tab ${activeTab === 'mark' ? 'active' : ''}`} 
            onClick={() => setActiveTab('mark')}
          >
            Mark Daily Attendance
          </button>
        )}
        <button 
          className={`tab ${activeTab === 'report' ? 'active' : ''}`} 
          onClick={() => setActiveTab('report')}
        >
          View Attendance Report
        </button>
      </div>

      <div className="attendance-page__content">
        {activeTab === 'mark' ? <AttendanceMarkingGrid /> : <AttendanceReportView />}
      </div>
    </div>
  );
};

export default AttendancePage;
