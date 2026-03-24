import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { fetchStudents } from '../students/studentSlice.js';
import { assignStudent, unassignStudent, deleteTransport } from './transportSlice.js';
import { assignStudentSchema } from './transportSchemas.js';
import './RouteDetailPanel.css';

const RouteDetailPanel = ({ route, onClose, onEdit, isAdmin }) => {
  const dispatch = useDispatch();
  const { students = [] } = useSelector((state) => state.students);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [unassignModalOpen, setUnassignModalOpen] = useState(false);
  const [studentToUnassign, setStudentToUnassign] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assignStudentSchema),
    defaultValues: {
      studentId: '',
    },
  });

  useEffect(() => {
    if (isAdmin && assignModalOpen) {
      dispatch(fetchStudents({ limit: 500 }));
    }
  }, [dispatch, isAdmin, assignModalOpen]);

  // Filter out students already assigned to this route
  const availableStudents = useMemo(() => {
    if (!Array.isArray(students) || students.length === 0) {
      return [];
    }

    const assignedIds = new Set(
      (route.assignedStudents || []).map((assigned) => assigned?._id || assigned?.id || assigned),
    );

    return students.filter((student) => !assignedIds.has(student._id));
  }, [students, route.assignedStudents]);

  const getDisplayName = (student) => {
    if (!student) {
      return 'Unknown Student';
    }

    if (student.name) {
      return student.name;
    }

    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
    return fullName || 'Unknown Student';
  };

  const handleAssignSubmit = async (data) => {
    const resultAction = await dispatch(assignStudent({
      transportId: route._id,
      studentId: data.studentId,
    }));

    if (assignStudent.fulfilled.match(resultAction)) {
      setAssignModalOpen(false);
      reset();
    }
  };

  const handleUnassignClick = (student) => {
    setStudentToUnassign(student);
    setUnassignModalOpen(true);
  };

  const handleConfirmUnassign = async () => {
    if (!studentToUnassign) return;
    const resultAction = await dispatch(unassignStudent({
      transportId: route._id,
      studentId: studentToUnassign._id || studentToUnassign,
    }));

    if (unassignStudent.fulfilled.match(resultAction)) {
      setUnassignModalOpen(false);
      setStudentToUnassign(null);
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const resultAction = await dispatch(deleteTransport(route._id));
    if (deleteTransport.fulfilled.match(resultAction)) {
      setDeleteModalOpen(false);
      onClose();
    }
  };

  return (
    <div className="route-detail-panel">
      <div className="route-detail-panel__header">
        <h3 className="route-detail-panel__title">{route.routeName}</h3>
        <button
          type="button"
          className="route-detail-panel__close"
          onClick={onClose}
          aria-label="Close panel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="route-detail-panel__info">
        <div className="route-detail-panel__info-row">
          <span className="route-detail-panel__label">Vehicle</span>
          <span className="route-detail-panel__value">{route.vehicleNumber}</span>
        </div>
        <div className="route-detail-panel__info-row">
          <span className="route-detail-panel__label">Driver</span>
          <span className="route-detail-panel__value">{route.driverName}</span>
        </div>
        <div className="route-detail-panel__info-row">
          <span className="route-detail-panel__label">Phone</span>
          <span className="route-detail-panel__value">{route.driverPhone}</span>
        </div>
      </div>

      {/* Stops Section */}
      <div className="route-detail-panel__section">
        <h4 className="route-detail-panel__section-title">
          Stops ({route.stops?.length || 0})
        </h4>
        {route.stops && route.stops.length > 0 ? (
          <ul className="route-detail-panel__stops-list">
            {route.stops.map((stop, index) => (
              <li key={stop._id || index} className="route-detail-panel__stop-item">
                <div className="route-detail-panel__stop-name">{stop.stopName}</div>
                <div className="route-detail-panel__stop-times">
                  {stop.pickUpTime && (
                    <span className="route-detail-panel__stop-time">
                      Pick-up: {stop.pickUpTime}
                    </span>
                  )}
                  {stop.dropTime && (
                    <span className="route-detail-panel__stop-time">
                      Drop: {stop.dropTime}
                    </span>
                  )}
                  {stop.feeAmount > 0 && (
                    <span className="route-detail-panel__stop-fee">
                      Fee: ${stop.feeAmount}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="route-detail-panel__empty">No stops defined</p>
        )}
      </div>

      {/* Students Section */}
      <div className="route-detail-panel__section">
        <div className="route-detail-panel__section-header">
          <h4 className="route-detail-panel__section-title">
            Assigned Students ({route.assignedStudents?.length || 0})
          </h4>
          {isAdmin && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => setAssignModalOpen(true)}
            >
              Assign Student
            </button>
          )}
        </div>
        {route.assignedStudents && route.assignedStudents.length > 0 ? (
          <ul className="route-detail-panel__students-list">
            {route.assignedStudents.map((student) => (
              <li key={student._id || student} className="route-detail-panel__student-item">
                <div className="route-detail-panel__student-info">
                  <span className="route-detail-panel__student-name">
                    {getDisplayName(student)}
                  </span>
                  {student.email && (
                    <span className="route-detail-panel__student-email">{student.email}</span>
                  )}
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline btn-danger"
                    onClick={() => handleUnassignClick(student)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="route-detail-panel__empty">No students assigned</p>
        )}
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="route-detail-panel__actions">
          {onEdit && (
            <button type="button" className="btn btn-secondary" onClick={onEdit}>
              Edit Route
            </button>
          )}
          <button type="button" className="btn btn-danger" onClick={handleDeleteClick}>
            Delete Route
          </button>
        </div>
      )}

      {/* Assign Student Modal */}
      {assignModalOpen && (
        <div className="route-detail-panel__modal-overlay">
          <div className="route-detail-panel__modal">
            <h4 className="route-detail-panel__modal-title">Assign Student</h4>
            <form onSubmit={handleSubmit(handleAssignSubmit)}>
              <div className="form-group">
                <label htmlFor="studentId">Select Student</label>
                <select
                  id="studentId"
                  className={`form-input ${errors.studentId ? 'form-input--error' : ''}`}
                  {...register('studentId')}
                >
                    <option value="">-- Select a student --</option>
                    {availableStudents.map((student) => (
                      <option key={student._id} value={student._id}>
                        {getDisplayName(student)}
                        {student.email ? ` (${student.email})` : ''}
                      </option>
                    ))}
                  </select>
                {errors.studentId && (
                  <span className="form-error">{errors.studentId.message}</span>
                )}
              </div>
              <div className="route-detail-panel__modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setAssignModalOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unassign Confirm Dialog */}
      <ConfirmDialog
        isOpen={unassignModalOpen}
        title="Remove Student"
        message={`Are you sure you want to remove ${getDisplayName(studentToUnassign)} from this route?`}
        confirmText="Remove"
        cancelText="Cancel"
        danger
        onConfirm={handleConfirmUnassign}
        onClose={() => {
          setUnassignModalOpen(false);
          setStudentToUnassign(null);
        }}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Route"
        message={`Are you sure you want to delete "${route.routeName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default RouteDetailPanel;
