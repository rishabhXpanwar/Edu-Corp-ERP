import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSectionTimetable, fetchMyTimetable, updateSectionTimetable } from './timetableSlice';
import { fetchClasses } from '../classes/classSlice';
import { fetchTeachers } from '../teachers/teacherSlice';
import PageHeader from '../../components/PageHeader';
import TimetableGrid from './TimetableGrid';
import TimetableEditModal from './TimetableEditModal';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import './TimetablePage.css';

const TimetablePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { schedule, loading } = useSelector((state) => state.timetable);
  const { classes } = useSelector((state) => state.classes);
  const { teachers = [] } = useSelector((state) => state.teachers);
  const classList = Array.isArray(classes) ? classes : [];
  
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  
  const [editModalConfig, setEditModalConfig] = useState({
    isOpen: false,
    day: null,
    periodIndex: null,
    initialData: null,
  });

  const isManager = user?.role === 'superAdmin' || user?.role === 'principal' || user?.role === 'academicManager' || user?.role === 'adminManager';

  useEffect(() => {
    if (isManager) {
      dispatch(fetchClasses());
      dispatch(fetchTeachers({ limit: 100 }));
    } else {
      // Teachers and Students see their own schedule
      dispatch(fetchMyTimetable());
    }
  }, [dispatch, isManager]);

  useEffect(() => {
    if (isManager && selectedSectionId) {
      dispatch(fetchSectionTimetable(selectedSectionId));
    }
  }, [dispatch, isManager, selectedSectionId]);

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setSelectedSectionId(''); // Reset section
  };

  const handleSectionChange = (e) => {
    setSelectedSectionId(e.target.value);
  };

  const selectedClassInfo = classList.find(c => c._id === selectedClassId);
  const sections = selectedClassInfo?.sections || [];

  const handleEditSlot = (day, periodIndex, periodData) => {
    if (!isManager) return;
    setEditModalConfig({
      isOpen: true,
      day,
      periodIndex,
      initialData: periodData,
    });
  };

  const closeEditModal = () => {
    setEditModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveSlot = (day, periodIndex, updatedPeriod) => {
    let newSchedule = Array.isArray(schedule) ? JSON.parse(JSON.stringify(schedule)) : [];
    
    let dayObj = newSchedule.find(s => s.day === day);
    if (!dayObj) {
      dayObj = { day, periods: [] };
      newSchedule.push(dayObj);
    }
    
    while (dayObj.periods.length <= periodIndex) {
      dayObj.periods.push(null);
    }

    if (updatedPeriod) {
      // Add periodNumber to track position (0-indexed)
      dayObj.periods[periodIndex] = { ...updatedPeriod, periodNumber: periodIndex };
    } else {
      dayObj.periods[periodIndex] = null;
    }

    // Filter out null periods and normalize teacherId to string ID
    const filteredSchedule = newSchedule
      .map(dayEntry => ({
        day: dayEntry.day,
        periods: dayEntry.periods
          .map((period, idx) => {
            if (!period) return null;
            // Ensure teacherId is a string ID, not a populated object
            const teacherId = typeof period.teacherId === 'object' 
              ? period.teacherId._id 
              : period.teacherId;
            return {
              subject: period.subject,
              teacherId,
              startTime: period.startTime,
              endTime: period.endTime,
              periodNumber: idx
            };
          })
          .filter(period => period !== null)
      }))
      .filter(dayEntry => dayEntry.periods.length > 0);

    dispatch(updateSectionTimetable({ sectionId: selectedSectionId, schedule: filteredSchedule }));
  };

  return (
    <div className="timetable-page">
      <PageHeader title="Timetable" />
      
      {isManager && (
        <div className="timetable-header-actions">
          <select value={selectedClassId} onChange={handleClassChange} className="timetable-select">
            <option value="">Select Class...</option>
            {classList.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select value={selectedSectionId} onChange={handleSectionChange} className="timetable-select" disabled={!selectedClassId}>
            <option value="">Select Section...</option>
            {sections.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <>
          {(isManager && !selectedSectionId) ? (
            <div className="empty-state">
              <p>Please select a class and section to view the timetable.</p>
            </div>
          ) : (
            <TimetableGrid 
              schedule={schedule || []} 
              canEdit={isManager && !!selectedSectionId}
              onEditSlot={handleEditSlot}
            />
          )}
        </>
      )}

      {editModalConfig.isOpen && (
        <TimetableEditModal
          isOpen={editModalConfig.isOpen}
          onClose={closeEditModal}
          day={editModalConfig.day}
          periodIndex={editModalConfig.periodIndex}
          initialData={editModalConfig.initialData}
          onSave={handleSaveSlot}
          teachers={teachers}
        />
      )}
    </div>
  );
};

export default TimetablePage;
