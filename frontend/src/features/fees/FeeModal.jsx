import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../../components/Modal';
import { createFee, fetchFees } from './feeSlice';
import { fetchClasses } from '../classes/classSlice';
import { fetchStudents } from '../students/studentSlice';

const feeSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
  classId: z.string().min(1, 'Class is required'),
  studentId: z.string().min(1, 'Student is required'),
});

const FeeModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { classes = [], loading: classesLoading } = useSelector((state) => state.classes);
  const { students = [], loading: studentsLoading } = useSelector((state) => state.students);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      title: '',
      amount: '',
      dueDate: '',
      classId: '',
      studentId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchClasses());
      dispatch(fetchStudents({ limit: 100 }));
    } else {
      reset();
    }
  }, [isOpen, dispatch, reset]);

  const classIdValue = watch('classId');

  const filteredStudents = classIdValue
    ? students.filter(s => s.currentClass?._id === classIdValue || s.classId === classIdValue)
    : students;

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        amount: Number(data.amount),
        dueDate: data.dueDate,
        classId: data.classId,
        studentId: data.studentId,
      };

      await dispatch(createFee(payload)).unwrap();
      dispatch(fetchFees({ page: 1, limit: 20 }));
      onClose();
    } catch (error) {
      console.error('Failed to create fee:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Fee">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="form-group">
          <label>Fee Title / Description</label>
          <input
            type="text"
            {...register('title')}
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            placeholder="e.g. Tuition Fee Q1"
          />
          {errors.title && <span className="error-text">{errors.title.message}</span>}
        </div>

        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            {...register('amount', { valueAsNumber: true })}
            className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
            placeholder="5000"
          />
          {errors.amount && <span className="error-text">{errors.amount.message}</span>}
        </div>

        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            {...register('dueDate')}
            className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
          />
          {errors.dueDate && <span className="error-text">{errors.dueDate.message}</span>}
        </div>

        <div className="form-group">
          <label>Class</label>
          <select
            {...register('classId')}
            className={`form-control ${errors.classId ? 'is-invalid' : ''}`}
            disabled={classesLoading}
          >
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId && <span className="error-text">{errors.classId.message}</span>}
        </div>

        <div className="form-group">
          <label>Student</label>
          <select
            {...register('studentId')}
            className={`form-control ${errors.studentId ? 'is-invalid' : ''}`}
            disabled={studentsLoading}
          >
            <option value="">-- Select Student --</option>
            {filteredStudents.map((std) => (
              <option key={std._id} value={std._id}>
                {std.firstName} {std.lastName} {std.admissionNumber ? `(${std.admissionNumber})` : ''}
              </option>
            ))}
          </select>
          {errors.studentId && <span className="error-text">{errors.studentId.message}</span>}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Fee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FeeModal;
