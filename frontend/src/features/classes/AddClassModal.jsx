import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClass, updateClass } from './classSlice.js';
import { classSchema } from './classSchemas.js';
import Modal from '../../components/Modal.jsx';

const AddClassModal = ({ isOpen, onClose, editingClass }) => {
  const dispatch = useDispatch();
  const { academicYears } = useSelector((state) => state.classes);
  const currentYear = academicYears.find(y => y.isCurrent);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      level: 1,
      academicYearId: currentYear?._id || ''
    }
  });

  useEffect(() => {
    if (editingClass) {
      setValue('name', editingClass.name);
      setValue('level', editingClass.level);
      setValue('academicYearId', editingClass.academicYear.toString() || editingClass.academicYearId || currentYear?._id);
    } else {
      reset();
      if (currentYear) setValue('academicYearId', currentYear._id);
    }
  }, [editingClass, setValue, reset, currentYear]);

  const onSubmit = (data) => {
    if (editingClass) {
      dispatch(updateClass({ id: editingClass._id, ...data })).unwrap().then(() => onClose());
    } else {
      dispatch(createClass(data)).unwrap().then(() => onClose());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingClass ? "Edit Class" : "Add Class"}>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="form-group">
          <label>Class Name</label>
          <input type="text" {...register('name')} placeholder="e.g. 10th Grade" />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
        </div>
        <div className="form-group">
          <label>Level (Numeric)</label>
          <input type="number" min="1" {...register('level')} placeholder="e.g. 10" />
          {errors.level && <span className="error-text">{errors.level.message}</span>}
        </div>
        <div className="form-group">
          <label>Academic Year</label>
          <select {...register('academicYearId')}>
            <option value="">Select Year</option>
            {academicYears.map(year => (
              <option key={year._id} value={year._id}>{year.name}</option>
            ))}
          </select>
          {errors.academicYearId && <span className="error-text">{errors.academicYearId.message}</span>}
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddClassModal;
