import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteExam } from './examSlice';
import DateSheetView from './DateSheetView';
import ConfirmDialog from '../../components/ConfirmDialog';
import './ExamsPage.css';
import { toast } from 'react-hot-toast';

const ExamCard = ({ exam }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showDatesheet, setShowDatesheet] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = ['superAdmin', 'principal', 'academicManager', 'manager'].includes(user?.role);

  const handleDelete = async () => {
    try {
      await dispatch(deleteExam(exam._id)).unwrap();
    } catch (err) {
      console.error('Failed to delete exam', err);
    }
    setIsDeleting(false);
  };

  const statusClass = new Date(exam.endDate) < new Date() ? 'status-completed' : 'status-upcoming';
  const statusLabel = new Date(exam.endDate) < new Date() ? 'Completed' : 'Upcoming';

  return (
    <div className="exam-card">
      <div className="exam-card-header">
        <div className="exam-title-group">
          <h3 className="exam-title">{exam.title}</h3>
          <span className={`exam-status ${statusClass}`}>{statusLabel}</span>
        </div>
        {canEdit && (
          <div className="exam-actions">
            <button className="btn-icon btn-danger" onClick={() => setIsDeleting(true)} title="Delete Exam">
               <span className="material-icons">delete</span>
            </button>
          </div>
        )}
      </div>

      <div className="exam-card-body">
        <div className="exam-detail">
          <span className="detail-label">Start Date:</span>
          <span>{new Date(exam.startDate).toLocaleDateString()}</span>
        </div>
        <div className="exam-detail">
          <span className="detail-label">End Date:</span>
          <span>{new Date(exam.endDate).toLocaleDateString()}</span>
        </div>
        <div className="exam-detail">
          <span className="detail-label">Classes:</span>
          <span>
            {exam.classes && exam.classes.length > 0 
              ? exam.classes.map(c => c.name || 'Class').join(', ') 
              : 'N/A'}
          </span>
        </div>
      </div>

      <div className="exam-card-footer">
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => setShowDatesheet(!showDatesheet)}
        >
          {showDatesheet ? 'Hide Schedule' : 'View Schedule'}
        </button>
      </div>

      {showDatesheet && (
        <div className="exam-datesheet-wrapper">
          <DateSheetView dateSheet={exam.dateSheet} />
        </div>
      )}

      {isDeleting && (
        <ConfirmDialog
          title="Delete Exam"
          message={`Are you sure you want to delete ${exam.title}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleting(false)}
          confirmText="Delete"
          confirmType="danger"
        />
      )}
    </div>
  );
};

export default ExamCard;
