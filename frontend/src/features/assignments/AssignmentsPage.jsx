import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments } from './assignmentSlice';
import { fetchClasses } from '../classes/classSlice';
import PageHeader from '../../components/PageHeader';
import AssignmentCard from './AssignmentCard';
import CreateAssignmentModal from './CreateAssignmentModal';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { FiPlus } from 'react-icons/fi';
import './AssignmentsPage.css';

const AssignmentsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { classes } = useSelector((state) => state.classes);
  const { items, loading, error } = useSelector((state) => state.assignment);
  
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Only fetch classes if they aren't loaded and user is authorized
    if (
      classes?.length === 0 && 
      ['principal', 'academicManager', 'adminManager', 'teacher'].includes(user?.role)
    ) {
      dispatch(fetchClasses());
    }
  }, [dispatch, classes?.length, user?.role]);

  // Handle section switch - fetch assignments when section changes
  useEffect(() => {
    if (selectedSectionId) {
      dispatch(fetchAssignments(selectedSectionId));
    }
  }, [dispatch, selectedSectionId]);

  // Set default class/section for teachers or admins if classes are loaded
  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      const firstClass = classes[0];
      setSelectedClassId(firstClass._id);
      if (firstClass.sections && firstClass.sections.length > 0) {
        setSelectedSectionId(firstClass.sections[0]._id);
      }
    }
  }, [classes, selectedClassId]);

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    
    // Choose first section of the new class
    const selectedClassObj = classes.find(c => c._id === classId);
    if (selectedClassObj && selectedClassObj.sections && selectedClassObj.sections.length > 0) {
      setSelectedSectionId(selectedClassObj.sections[0]._id);
    } else {
      setSelectedSectionId('');
    }
  };

  const handleSectionChange = (e) => {
    setSelectedSectionId(e.target.value);
  };

  const currentClassSections = classes.find(c => c._id === selectedClassId)?.sections || [];

  const canCreate = ['principal', 'academicManager', 'teacher'].includes(user?.role);

  return (
    <div className="assignments-page">
      <PageHeader 
        title="Assignments" 
        subtitle="Manage and view class assignments"
      >
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <FiPlus /> New Assignment
          </button>
        )}
      </PageHeader>

      {['principal', 'academicManager', 'adminManager', 'teacher'].includes(user?.role) && (
        <div className="assignments-page__filters">
          <div className="assignments-page__filter-group">
            <label>Select Class</label>
            <select 
              className="assignments-page__select"
              value={selectedClassId} 
              onChange={handleClassChange}
            >
              {classes.length === 0 && <option value="">Loading classes...</option>}
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="assignments-page__filter-group">
            <label>Select Section</label>
            <select 
              className="assignments-page__select"
              value={selectedSectionId} 
              onChange={handleSectionChange}
              disabled={!selectedClassId}
            >
              {currentClassSections.length === 0 && <option value="">No sections available</option>}
              {currentClassSections.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && !loading && <div className="text-danger error-alert">{error.message || 'Error fetching assignments'}</div>}

      <div className="assignments-page__content">
        {loading ? (
          <div className="p-8 flex-center"><Spinner /></div>
        ) : !selectedSectionId ? (
          <EmptyState 
            title="No Section Selected" 
            message="Please select a class and section to view assignments." 
            icon={<FiPlus />}
          />
        ) : items.length === 0 ? (
          <EmptyState 
            title="No Assignments Found" 
            message="There are no assignments for this section." 
            icon={<FiPlus />} 
          />
        ) : (
          <div className="assignments-page__list">
            {items.map(assignment => (
              <AssignmentCard key={assignment._id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>

      <CreateAssignmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        selectedClassId={selectedClassId}
        selectedSectionId={selectedSectionId}
      />
    </div>
  );
};

export default AssignmentsPage;
