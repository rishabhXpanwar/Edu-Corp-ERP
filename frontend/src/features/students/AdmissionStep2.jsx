import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses } from '../classes/classSlice.js';

const AdmissionStep2 = () => {
  const { register, watch, formState: { errors } } = useFormContext();
  const dispatch = useDispatch();
  const { classes } = useSelector(state => state.classes);
  
  const classId = watch('student.classId');
  const selectedClass = classes.find(c => c._id === classId);
  const sections = selectedClass?.sections || [];

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  return (
    <div className="step-content">
      <h3>Academic Details</h3>
      <div className="form-group">
        <label>Admission Number</label>
        <input type="text" {...register('student.admissionNumber')} placeholder="e.g. ADM-2024-001" />
        {errors.student?.admissionNumber && <span className="error-text">{errors.student.admissionNumber.message}</span>}
      </div>
      <div className="form-group">
        <label>Class</label>
        <select {...register('student.classId')}>
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        {errors.student?.classId && <span className="error-text">{errors.student.classId.message}</span>}
      </div>
      <div className="form-group">
        <label>Section</label>
        <select {...register('student.sectionId')} disabled={!classId}>
          <option value="">Select Section</option>
          {sections.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        {errors.student?.sectionId && <span className="error-text">{errors.student.sectionId.message}</span>}
      </div>
    </div>
  );
};

export default AdmissionStep2;
