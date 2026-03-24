import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAssignmentSchema } from './assignmentSchemas';
import { createAssignment } from './assignmentSlice';
import Modal from '../../components/Modal';
import FileUploader from '../../components/FileUploader';
import { clearError } from './assignmentSlice';

const CreateAssignmentModal = ({ isOpen, onClose, selectedClassId, selectedSectionId }) => {
  const dispatch = useDispatch();
  const { classes } = useSelector((state) => state.classes);
  const { loading, error } = useSelector((state) => state.assignment);
  const [attachments, setAttachments] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      classId: selectedClassId || '',
      sectionId: selectedSectionId || '',
      dueDate: '',
      attachments: []
    }
  });

  const selectedClass = watch('classId');

  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        description: '',
        subject: '',
        classId: selectedClassId || '',
        sectionId: selectedSectionId || '',
        dueDate: '',
        attachments: []
      });
      setAttachments([]);
      dispatch(clearError());
    }
  }, [isOpen, reset, selectedClassId, selectedSectionId, dispatch]);

  const handleUploadSuccess = (fileData) => {
    const newAttachments = [...attachments, fileData];
    setAttachments(newAttachments);
    setValue('attachments', newAttachments);
  };

  const onSubmit = async (data) => {
    // attachments are set via setValue, so data.attachments should be up to date
    const finalData = { ...data };
    const resultAction = await dispatch(createAssignment(finalData));
    if (createAssignment.fulfilled.match(resultAction)) {
      onClose();
    }
  };

  const currentClassSections = classes?.find((c) => c._id === selectedClass)?.sections || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Assignment" size="md">
      <form className="assignment-form" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="form-error">
            {typeof error === 'string' ? error : error.message || 'Validation Failed'}
          </div>
        )}

        <div className="assignment-form__group">
          <label className="assignment-form__label">Title *</label>
          <input
            type="text"
            className="assignment-form__input"
            disabled={loading}
            {...register('title')}
          />
          {errors.title && <span className="assignment-form__error">{errors.title.message}</span>}
        </div>

        <div className="assignment-form__group">
          <label className="assignment-form__label">Description *</label>
          <textarea
            className="assignment-form__textarea"
            disabled={loading}
            {...register('description')}
          ></textarea>
          {errors.description && <span className="assignment-form__error">{errors.description.message}</span>}
        </div>

        <div className="assignment-form__group">
          <label className="assignment-form__label">Subject *</label>
          <input
            type="text"
            className="assignment-form__input"
            disabled={loading}
            {...register('subject')}
          />
          {errors.subject && <span className="assignment-form__error">{errors.subject.message}</span>}
        </div>

        <div className="grid-2">
          <div className="assignment-form__group">
            <label className="assignment-form__label">Class *</label>
            <select
              className="assignment-form__select"
              disabled={loading}
              {...register('classId')}
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.classId && <span className="assignment-form__error">{errors.classId.message}</span>}
          </div>

          <div className="assignment-form__group">
            <label className="assignment-form__label">Section *</label>
            <select
              className="assignment-form__select"
              disabled={loading || !selectedClass}
              {...register('sectionId')}
            >
              <option value="">Select Section</option>
              {currentClassSections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.sectionId && <span className="assignment-form__error">{errors.sectionId.message}</span>}
          </div>
        </div>

        <div className="assignment-form__group">
          <label className="assignment-form__label">Due Date *</label>
          <input
            type="date"
            className="assignment-form__input"
            disabled={loading}
            {...register('dueDate')}
          />
          {errors.dueDate && <span className="assignment-form__error">{errors.dueDate.message}</span>}
        </div>

        <div className="assignment-form__group">
          <label className="assignment-form__label">Attachments</label>
          <FileUploader onUploadSuccess={handleUploadSuccess} />
          {attachments.length > 0 && (
            <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {attachments.map((att, idx) => (
                <li key={idx} className="text-primary">{att.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAssignmentModal;
