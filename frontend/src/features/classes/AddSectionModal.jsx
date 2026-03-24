import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSection, updateSection } from './classSlice.js';
import { sectionSchema } from './classSchemas.js';
import Modal from '../../components/Modal.jsx';

const AddSectionModal = ({ isOpen, onClose, classId, editingSection }) => {
  const dispatch = useDispatch();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(sectionSchema),
    defaultValues: { name: '', classTeacherId: '' }
  });

  useEffect(() => {
    if (editingSection) {
      setValue('name', editingSection.name);
      setValue('classTeacherId', editingSection.classTeacherId || '');
    } else {
      reset();
    }
  }, [editingSection, setValue, reset]);

  const onSubmit = (data) => {
    const payload = {
      ...data,
      classTeacherId: data.classTeacherId?.trim() || undefined,
    };

    if (editingSection) {
      dispatch(updateSection({ classId, sectionId: editingSection._id, ...payload })).unwrap().then(() => onClose());
    } else {
      dispatch(createSection({ classId, sectionData: payload })).unwrap().then(() => onClose());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingSection ? "Edit Section" : "Add Section"}>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="form-group">
          <label>Section Name</label>
          <input type="text" {...register('name')} placeholder="e.g. A" />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
        </div>
        <div className="form-group">
          <label>Class Teacher (Optional)</label>
          <input type="text" {...register('classTeacherId')} placeholder="Teacher ID" />
          {/* Will replace with a teacher dropdown in later components of Phase 3, but text field for now */}
          {errors.classTeacherId && <span className="error-text">{errors.classTeacherId.message}</span>}
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSectionModal;
