import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAcademicYear, setCurrentAcademicYear } from './classSlice.js';
import { academicYearSchema } from './classSchemas.js';
import Modal from '../../components/Modal.jsx';
import './AcademicYearPanel.css';

const AcademicYearPanel = () => {
  const dispatch = useDispatch();
  const { academicYears, currentYear } = useSelector((state) => state.classes);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(academicYearSchema)
  });

  const onSubmit = (data) => {
    dispatch(createAcademicYear(data)).unwrap().then(() => {
      setIsModalOpen(false);
      reset();
    });
  };

  return (
    <div className="ay-panel">
      <div className="ay-panel__header">
        <h2>Academic Years</h2>
        <button className="btn btn-outline" onClick={() => setIsModalOpen(true)}>
          New Year
        </button>
      </div>
      <div className="ay-panel__list">
        {academicYears.map((year) => (
          <div key={year._id} className={`ay-panel__item ${year.isCurrent ? 'ay-panel__item--current' : ''}`}>
            <span>{year.name}</span>
            <span className="ay-panel__dates">
              {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
            </span>
            {!year.isCurrent && (
              <button 
                className="btn btn-small btn-primary"
                onClick={() => dispatch(setCurrentAcademicYear(year._id))}
              >
                Set Current
              </button>
            )}
            {year.isCurrent && <span className="ay-panel__badge">Current</span>}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); reset(); }} title="New Academic Year">
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" {...register('name')} placeholder="e.g. 2024-2025" />
            {errors.name && <span className="error-text">{errors.name.message}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" {...register('startDate')} />
              {errors.startDate && <span className="error-text">{errors.startDate.message}</span>}
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" {...register('endDate')} />
              {errors.endDate && <span className="error-text">{errors.endDate.message}</span>}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicYearPanel;
