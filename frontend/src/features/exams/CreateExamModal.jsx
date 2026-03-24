import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { createExam } from './examSlice';
import { examSchema } from './examSchemas';
import { fetchClasses } from '../classes/classSlice';
import Modal from '../../components/Modal';
import './ExamsPage.css';

const CreateExamModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { classes } = useSelector((state) => state.classes);
  const classItems = Array.isArray(classes) ? classes : classes?.items || [];
  
  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      startDate: '',
      endDate: '',
      classes: [],
      dateSheet: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dateSheet'
  });

  useEffect(() => {
    dispatch(fetchClasses({ limit: 100 }));
  }, [dispatch]);

  const selectedClasses = watch('classes') || [];

  const onSubmit = async (data) => {
    try {
      await dispatch(createExam(data)).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to create exam', err);
    }
  };

  return (
    <Modal title="Create Exam" onClose={onClose} size="large">
      <form onSubmit={handleSubmit(onSubmit)} className="create-exam-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Exam Title *</label>
            <input type="text" className="form-control" placeholder="e.g. Mid Term V1" {...register('title')} />
            {errors.title && <span className="error-text">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label>Start Date *</label>
            <input type="date" className="form-control" {...register('startDate')} />
            {errors.startDate && <span className="error-text">{errors.startDate.message}</span>}
          </div>

          <div className="form-group">
            <label>End Date *</label>
            <input type="date" className="form-control" {...register('endDate')} />
            {errors.endDate && <span className="error-text">{errors.endDate.message}</span>}
          </div>

          <div className="form-group full-width">
            <label>Classes Included *</label>
            <div className="checkbox-group">
              {classItems.map((cls) => (
                <label key={cls._id} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={cls._id}
                    {...register('classes')}
                  />
                  {cls.name}
                </label>
              ))}
            </div>
            {errors.classes && <span className="error-text">{errors.classes.message}</span>}
          </div>
        </div>

        <div className="datesheet-section">
          <div className="datesheet-header">
            <h4>Date Sheet</h4>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => append({ classId: '', sectionId: '', subject: '', date: '', startTime: '', endTime: '' })}
            >
              + Add Row
            </button>
          </div>

          {fields.map((field, index) => {
             // We need to render rows. To simplify section selection, we just grab sections for the selected class row
             return (
              <div key={field.id} className="datesheet-row">
                <div className="form-group">
                  <Controller
                    name={`dateSheet.${index}.classId`}
                    control={control}
                    render={({ field: selectField }) => (
                      <select className="form-control form-control-sm" {...selectField}>
                        <option value="">Select Class</option>
                        {classItems.filter(c => selectedClasses.includes(c._id)).map((cls) => (
                          <option key={cls._id} value={cls._id}>{cls.name}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.dateSheet?.[index]?.classId && <span className="error-text">{errors.dateSheet[index].classId.message}</span>}
                </div>

                <div className="form-group">
                  <Controller
                    name={`dateSheet.${index}.sectionId`}
                    control={control}
                    render={({ field: selectField }) => {
                      const rowClassId = watch(`dateSheet.${index}.classId`);
                      const selectedClassObj = classItems.find(c => c._id === rowClassId);
                      const sections = selectedClassObj?.sections || [];
                      
                      return (
                        <select className="form-control form-control-sm" {...selectField} disabled={!rowClassId}>
                           <option value="">Select Sec</option>
                           {sections.map(sec => (
                             <option key={sec._id || sec} value={sec._id || sec}>{sec.name || 'Sec'}</option>
                           ))}
                        </select>
                      )
                    }}
                  />
                  {errors.dateSheet?.[index]?.sectionId && <span className="error-text">{errors.dateSheet[index].sectionId.message}</span>}
                </div>

                <div className="form-group">
                  <input type="text" className="form-control form-control-sm" placeholder="Subject" {...register(`dateSheet.${index}.subject`)} />
                  {errors.dateSheet?.[index]?.subject && <span className="error-text">{errors.dateSheet[index].subject.message}</span>}
                </div>

                <div className="form-group">
                  <input type="date" className="form-control form-control-sm" {...register(`dateSheet.${index}.date`)} />
                  {errors.dateSheet?.[index]?.date && <span className="error-text">{errors.dateSheet[index].date.message}</span>}
                </div>

                <div className="form-group">
                  <input type="time" className="form-control form-control-sm" {...register(`dateSheet.${index}.startTime`)} />
                  {errors.dateSheet?.[index]?.startTime && <span className="error-text">{errors.dateSheet[index].startTime.message}</span>}
                </div>

                <div className="form-group">
                  <input type="time" className="form-control form-control-sm" {...register(`dateSheet.${index}.endTime`)} />
                  {errors.dateSheet?.[index]?.endTime && <span className="error-text">{errors.dateSheet[index].endTime.message}</span>}
                </div>

                <div className="row-actions">
                  <button type="button" className="btn-icon btn-danger" onClick={() => remove(index)} title="Remove Row">
                    <span className="material-icons">close</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer pt-4 flex gap-2 justify-end">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Exam'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateExamModal;
