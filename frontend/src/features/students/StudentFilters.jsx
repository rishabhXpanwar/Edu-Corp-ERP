import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses } from '../classes/classSlice.js';

const StudentFilters = ({ filters, setFilters }) => {
  const dispatch = useDispatch();
  const { classes } = useSelector(state => state.classes);
  const classList = Array.isArray(classes) ? classes : [];
  
  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  const handleClassChange = (e) => {
    setFilters({ ...filters, classId: e.target.value, sectionId: '' });
  };

  const handleSectionChange = (e) => {
    setFilters({ ...filters, sectionId: e.target.value });
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const selectedClass = classList.find(c => c._id === filters.classId);
  const sections = selectedClass?.sections || [];

  return (
    <div className="filters-panel">
      <div className="form-group">
        <label>Search Name/Email</label>
        <input 
          type="text" 
          value={filters.search} 
          onChange={handleSearchChange} 
          placeholder="Search students..." 
        />
      </div>
      <div className="form-group">
        <label>Class</label>
        <select value={filters.classId} onChange={handleClassChange}>
          <option value="">All Classes</option>
          {classList.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Section</label>
        <select value={filters.sectionId} onChange={handleSectionChange} disabled={!filters.classId}>
          <option value="">All Sections</option>
          {sections.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default StudentFilters;
