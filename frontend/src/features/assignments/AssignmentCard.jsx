import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAssignment } from './assignmentSlice';
import { FiTrash2, FiPaperclip, FiCalendar } from 'react-icons/fi';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useState } from 'react';

const AssignmentCard = ({ assignment }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Check if user can delete (creator or principal/admin)
  const isCreator = typeof assignment.teacherId === 'object' 
    ? assignment.teacherId?._id === user?._id 
    : assignment.teacherId === user?._id;
  
  const canDelete = isCreator || ['principal', 'academicManager'].includes(user?.role);

  const handleDelete = () => {
    dispatch(deleteAssignment(assignment._id));
    setShowConfirmDialog(false);
  };

  // Determine due date status
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue = dueDate < now;
  
  // Format date
  const formattedDate = dueDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="assignment-card">
      <div className="assignment-card__header">
        <h3 className="assignment-card__title">{assignment.title}</h3>
        {canDelete && (
          <button 
            type="button" 
            className="assignment-card__delete-btn"
            onClick={() => setShowConfirmDialog(true)}
            title="Delete Assignment"
          >
            <FiTrash2 />
          </button>
        )}
      </div>

      <div className="assignment-card__meta">
        <span className="assignment-card__subject">{assignment.subject}</span>
        <span className={`assignment-card__due-badge ${isOverdue ? 'assignment-card__due-badge--overdue' : 'assignment-card__due-badge--upcoming'}`}>
          <FiCalendar /> {isOverdue ? 'Overdue: ' : 'Due: '} {formattedDate}
        </span>
      </div>

      <p className="assignment-card__desc">{assignment.description}</p>

      {assignment.attachments && assignment.attachments.length > 0 && (
        <div className="assignment-card__attachments">
          <h4 className="assignment-card__attachments-title">
            <FiPaperclip /> Attachments ({assignment.attachments.length})
          </h4>
          <ul className="assignment-card__attachments-list">
            {assignment.attachments.map((attachment, idx) => (
              <li key={idx} className="assignment-card__attachment-item">
                <a href={attachment.url} target="_blank" rel="noreferrer" className="assignment-card__attachment-link">
                  {attachment.name || 'Attachment'}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showConfirmDialog && (
        <ConfirmDialog
          title="Delete Assignment"
          message={`Are you sure you want to delete "${assignment.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
};

export default AssignmentCard;
