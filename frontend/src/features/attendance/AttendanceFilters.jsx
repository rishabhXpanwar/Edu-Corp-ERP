import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses } from '../classes/classSlice.js';

const AttendanceFilters = ({ filters, setFilters, allowDate = false, allowMonthYear = false }) => {
  const dispatch = useDispatch();
  const { classes } = useSelector(state => state.classes);
  
  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  const handleClassChange = (e) => {
    setFilters(prev => ({ ...prev, classId: e.target.value, sectionId: '' }));
  };

  const handleSectionChange = (e) => {
    setFilters(prev => ({ ...prev, sectionId: e.target.value }));
  };

  const handleDateChange = (e) => {
    setFilters(prev => ({ ...prev, date: e.target.value }));
  };

  const selectedClass = classes.find(c => c._id === filters.classId);
  const sections = selectedClass?.sections || [];

  return (
    <div className="filters-panel">
      <div className="form-group">
        <label>Class</label>
        <select value={filters.classId} onChange={handleClassChange}>
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Section</label>
        <select value={filters.sectionId} onChange={handleSectionChange} disabled={!filters.classId}>
          <option value="">Select Section</option>
          {sections.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>
      
      {allowDate && (
        <div className="form-group">
          <label>Date</label>
          <input 
            type="date" 
            value={filters.date} 
            onChange={handleDateChange} 
            max={new Date().toISOString().split('T')[0]} 
          />
        </div>
      )}

      {allowMonthYear && (
        <>
          <div className="form-group">
            <label>Month</label>
            <select value={filters.month} onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}>
              <option value="">Full Year</option>
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Year</label>
            <input 
              type="number" 
              value={filters.year} 
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              min="2000"
              max="2100"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceFilters;
