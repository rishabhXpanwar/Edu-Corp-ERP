import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentById, updateStudent, deactivateStudent } from './studentSlice.js';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import './StudentDetailPage.css';

const StudentDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { selectedStudent, loading, error } = useSelector(state => state.students);
  const [activeTab, setActiveTab] = useState('profile');
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchStudentById(id));
  }, [dispatch, id]);

  const handleDeactivate = () => {
    dispatch(deactivateStudent(id));
    setIsDeactivateDialogOpen(false);
  };

  if (loading && !selectedStudent) return <Spinner />;
  if (error || !selectedStudent) return <EmptyState title="Student Not Found" />;

  const { student, parent } = selectedStudent;

  return (
    <div className="student-detail">
      <div className="student-detail__banner">
        <div className="student-detail__profile">
          <img 
            src={student.avatarUrl || `https://ui-avatars.com/api/?name=${student.name}&background=random`} 
            alt="Profile Avatar" 
            className="student-detail__avatar" 
          />
          <div className="student-detail__info">
            <h2>{student.name}</h2>
            <p>Admission No: {student.admissionNumber}</p>
            <p className="badge badge-primary">{student.classId?.name || 'N/A'} - {student.sectionId?.name || 'N/A'}</p>
            {!student.isActive && <span className="badge badge-danger" style={{ marginLeft: '8px' }}>Deactivated</span>}
          </div>
        </div>
        <div className="student-detail__actions">
          {student.isActive && (
            <button className="btn btn-danger btn-outline" onClick={() => setIsDeactivateDialogOpen(true)}>
              Deactivate
            </button>
          )}
        </div>
      </div>

      <div className="student-detail__tabs">
        {['profile', 'academic', 'parent', 'attendance', 'fees'].map(tab => (
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
              <div className="info-item"><span>Email</span><p>{student.email}</p></div>
              <div className="info-item"><span>Phone</span><p>{student.phone}</p></div>
              <div className="info-item"><span>Joined</span><p>{new Date(student.createdAt).toLocaleDateString()}</p></div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="detail-card">
            <h3>Academic Information</h3>
            <div className="info-grid">
              <div className="info-item"><span>Class</span><p>{student.classId?.name || 'N/A'}</p></div>
              <div className="info-item"><span>Section</span><p>{student.sectionId?.name || 'N/A'}</p></div>
              <div className="info-item"><span>Admission Number</span><p>{student.admissionNumber}</p></div>
            </div>
          </div>
        )}

        {activeTab === 'parent' && (
          <div className="detail-card">
            <h3>Parent / Guardian Details</h3>
            {parent ? (
              <div className="info-grid">
                <div className="info-item"><span>Name</span><p>{parent.name}</p></div>
                <div className="info-item"><span>Email</span><p>{parent.email}</p></div>
                <div className="info-item"><span>Phone</span><p>{parent.phone}</p></div>
              </div>
            ) : (
              <p>No parent linked to this account.</p>
            )}
          </div>
        )}

        {(activeTab === 'attendance' || activeTab === 'fees') && (
          <div className="detail-card">
            <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} (Coming Soon)</h3>
            <p>This section will be integrated when the corresponding modules are implemented.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeactivateDialogOpen}
        title="Deactivate Student"
        message="Are you sure you want to deactivate this student? They will not be able to log in."
        confirmText="Deactivate"
        onConfirm={handleDeactivate}
        onCancel={() => setIsDeactivateDialogOpen(false)}
        isDanger={true}
      />
    </div>
  );
};

export default StudentDetailPage;
