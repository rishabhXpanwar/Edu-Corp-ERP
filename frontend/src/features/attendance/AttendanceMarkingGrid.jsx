import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSectionAttendance, markAttendance, resetRecords } from './attendanceSlice.js';
import { fetchStudents } from '../students/studentSlice.js';
import AttendanceFilters from './AttendanceFilters.jsx';
import Spinner from '../../components/Spinner.jsx';
import toast from 'react-hot-toast';

const AttendanceMarkingGrid = () => {
  const dispatch = useDispatch();
  const { records, loading, saving } = useSelector(state => state.attendance);
  const { students } = useSelector(state => state.students);
  
  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({ classId: '', sectionId: '', date: today });
  
  // Local state for toggles until saved
  const [localRecords, setLocalRecords] = useState({});

  useEffect(() => {
    if (filters.classId && filters.sectionId && filters.date) {
      // First fetch students for that section to make sure we have the roster
      dispatch(fetchStudents({ classId: filters.classId, sectionId: filters.sectionId, limit: 100 }))
        .unwrap()
        .then((res) => {
          // Then try to fetch existing attendance record
          dispatch(fetchSectionAttendance({ sectionId: filters.sectionId, date: filters.date }));
        });
    } else {
      dispatch(resetRecords());
    }
  }, [dispatch, filters.classId, filters.sectionId, filters.date]);

  // Synchronize localRecords with backend state
  useEffect(() => {
    const studentRecords = {};
    if (students && students.length > 0) {
      students.forEach(student => {
        // Find if they exist in the saved record
        const savedRecord = records?.records?.find(r => r.studentId === student._id);
        studentRecords[student._id] = savedRecord ? savedRecord.status : 'Present'; // Default to Present
      });
      setLocalRecords(studentRecords);
    } else {
      setLocalRecords({});
    }
  }, [students, records]);

  const handleToggle = (studentId, status) => {
    setLocalRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = () => {
    if (!filters.classId || !filters.sectionId || !filters.date) {
      toast.error('Please select Class, Section, and Date to mark attendance.');
      return;
    }

    const payloadRecords = students.map(student => ({
      studentId: student._id,
      status: localRecords[student._id] || 'Present'
    }));

    const payload = {
      date: filters.date,
      classId: filters.classId,
      sectionId: filters.sectionId,
      records: payloadRecords
    };

    dispatch(markAttendance(payload));
  };

  const Pill = ({ status, activeStatus, onClick }) => {
    const isActive = status === activeStatus;
    const colors = {
      'Present': '#22C55E', // Green
      'Absent': '#EF4444',  // Red
      'Late': '#F59E0B',    // Orange
      'HalfDay': '#3B82F6'  // Blue
    };

    return (
      <button 
        className={`pill ${isActive ? 'active' : ''}`}
        onClick={onClick}
        style={isActive ? { backgroundColor: colors[status], borderColor: colors[status], color: 'white' } : {}}
      >
        {status.charAt(0)}
      </button>
    );
  };

  return (
    <div className="attendance-marking">
      <AttendanceFilters filters={filters} setFilters={setFilters} allowDate={true} />
      
      {loading ? (
        <Spinner />
      ) : !filters.sectionId ? (
        <div className="placeholder-state">Please select a class and section to view the roster.</div>
      ) : students.length === 0 ? (
        <div className="placeholder-state">No students found in this section.</div>
      ) : (
        <div className="grid-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Admission No.</th>
                  <th style={{ textAlign: 'center' }}>Mark Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const currentStatus = localRecords[student._id] || 'Present';
                  return (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.admissionNumber}</td>
                      <td>
                        <div className="pill-group">
                          <Pill status="Present" activeStatus={currentStatus} onClick={() => handleToggle(student._id, 'Present')} />
                          <Pill status="Absent" activeStatus={currentStatus} onClick={() => handleToggle(student._id, 'Absent')} />
                          <Pill status="Late" activeStatus={currentStatus} onClick={() => handleToggle(student._id, 'Late')} />
                          <Pill status="HalfDay" activeStatus={currentStatus} onClick={() => handleToggle(student._id, 'HalfDay')} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="sticky-footer">
             <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
               {saving ? 'Saving...' : 'Save Attendance'}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceMarkingGrid;
