import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeacherById, updateUserStatus } from './teacherSlice.js';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

const TeacherDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { selectedTeacher, loading, error } = useSelector(state => state.teachers);
  const [activeTab, setActiveTab] = useState('profile');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTeacherById(id));
  }, [dispatch, id]);

  const toggleStatus = () => {
    if (!selectedTeacher) return;
    dispatch(updateUserStatus({ id, isActive: !selectedTeacher.isActive }));
    setIsStatusDialogOpen(false);
  };

  if (loading && !selectedTeacher) return <Spinner />;
  if (error || !selectedTeacher) return <EmptyState title="Teacher Not Found" />;

  return (
    <div className="student-detail">
      {/* Reusing student-detail banner CSS for consistency */}
      <div className="student-detail__banner">
        <div className="student-detail__profile">
          <img 
            src={selectedTeacher.avatarUrl || `https://ui-avatars.com/api/?name=${selectedTeacher.name}&background=random`} 
            alt="Profile Avatar" 
            className="student-detail__avatar" 
          />
          <div className="student-detail__info">
            <h2>{selectedTeacher.name}</h2>
            <p>{selectedTeacher.designation || 'Teacher'}</p>
            <span className={`badge ${selectedTeacher.isActive ? 'badge-primary' : 'badge-danger'}`} style={{ marginTop: '8px' }}>
              {selectedTeacher.isActive ? 'Active' : 'Deactivated'}
            </span>
          </div>
        </div>
        <div className="student-detail__actions">
           <button 
             className={`btn ${selectedTeacher.isActive ? 'btn-danger' : 'btn-success'} btn-outline`} 
             onClick={() => setIsStatusDialogOpen(true)}
             style={!selectedTeacher.isActive ? { borderColor: 'white', color: 'white' } : {}}
           >
             {selectedTeacher.isActive ? 'Deactivate' : 'Activate'}
           </button>
        </div>
      </div>

      <div className="student-detail__tabs">
        {['profile', 'classes', 'attendance'].map(tab => (
          <button 
            key={tab} 
            className={`tab ${activeTab === tab ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="student-detail__content">
        {activeTab === 'profile' && (
          <div className="detail-card">
            <h3>Profile Details</h3>
            <div className="info-grid">
              <div className="info-item"><span>Email</span><p>{selectedTeacher.email}</p></div>
              <div className="info-item"><span>Phone</span><p>{selectedTeacher.phone}</p></div>
              <div className="info-item"><span>Subjects Taught</span><p>{selectedTeacher.subjectsTaught?.join(', ') || 'N/A'}</p></div>
              <div className="info-item"><span>Joined</span><p>{selectedTeacher.joiningDate ? new Date(selectedTeacher.joiningDate).toLocaleDateString() : 'N/A'}</p></div>
            </div>
          </div>
        )}

        {(activeTab === 'classes' || activeTab === 'attendance') && (
          <div className="detail-card">
            <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} (Coming Soon)</h3>
            <p>This section will be integrated when the corresponding modules are implemented.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isStatusDialogOpen}
        title={selectedTeacher.isActive ? "Deactivate Teacher" : "Activate Teacher"}
        message={`Are you sure you want to ${selectedTeacher.isActive ? 'deactivate' : 'activate'} this teacher? They will ${selectedTeacher.isActive ? 'not' : ''} be able to log in.`}
        confirmText="Confirm"
        onConfirm={toggleStatus}
        onCancel={() => setIsStatusDialogOpen(false)}
        isDanger={selectedTeacher.isActive}
      />
    </div>
  );
};

export default TeacherDetailPage;
