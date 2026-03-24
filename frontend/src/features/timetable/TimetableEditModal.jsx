import React, { useEffect } from 'react';
import Modal from '../../components/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { periodSchema } from './timetableSchemas';
import './TimetablePage.css';

const TimetableEditModal = ({ isOpen, onClose, day, periodIndex, initialData, onSave, teachers = [] }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(periodSchema),
    defaultValues: {
      subject: '',
      teacherId: '',
      startTime: '',
      endTime: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          subject: initialData.subject || '',
          teacherId: initialData.teacherId?._id || initialData.teacherId || '',
          startTime: initialData.startTime || '',
          endTime: initialData.endTime || '',
        });
      } else {
        reset({ subject: '', teacherId: '', startTime: '', endTime: '' });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data) => {
    onSave(day, periodIndex, data);
    onClose();
  };

  const handleClear = () => {
    onSave(day, periodIndex, null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} title={`Edit ${day} - Period ${periodIndex + 1}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="timetable-edit-form">
        <div className="form-group">
          <label>Subject</label>
          <input type="text" {...register('subject')} className="form-input" placeholder="e.g. Mathematics" />
          {errors.subject && <span className="error-text">{errors.subject.message}</span>}
        </div>
        
        <div className="form-group">
          <label>Teacher</label>
          <select {...register('teacherId')} className="form-input">
            <option value="">Select a teacher...</option>
            {teachers.map(t => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>
          {errors.teacherId && <span className="error-text">{errors.teacherId.message}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Time</label>
            <input type="time" {...register('startTime')} className="form-input" />
            {errors.startTime && <span className="error-text">{errors.startTime.message}</span>}
          </div>
          
          <div className="form-group">
            <label>End Time</label>
            <input type="time" {...register('endTime')} className="form-input" />
            {errors.endTime && <span className="error-text">{errors.endTime.message}</span>}
          </div>
        </div>

        <div className="modal-actions timetable-modal-actions">
          {initialData && (
            <button type="button" className="btn btn-danger" onClick={handleClear}>
              Clear Slot
            </button>
          )}
          <div className="actions-right">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default TimetableEditModal;
