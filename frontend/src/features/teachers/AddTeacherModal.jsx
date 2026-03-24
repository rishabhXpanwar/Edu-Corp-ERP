import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTeacher } from './teacherSlice.js';
import Modal from '../../components/Modal.jsx';

const phoneRegex = /^[0-9+\-\s()]+$/;

const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required').min(1, 'Email is required'),
  phone: z.string().regex(phoneRegex, 'Valid phone is required').min(1, 'Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  salary: z.coerce.number().optional(),
  subjectsTaught: z.string().optional() // Will split into array on submit
});

const AddTeacherModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(teacherSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', designation: '', joiningDate: '', subjectsTaught: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const payload = { ...data };
    
    if (payload.subjectsTaught) {
        payload.subjectsTaught = payload.subjectsTaught.split(',').map(s => s.trim()).filter(s => s);
    } else {
        payload.subjectsTaught = [];
    }
    
    if (!payload.password) delete payload.password;
    if (!payload.salary) delete payload.salary;
    if (!payload.joiningDate) delete payload.joiningDate;

    const resultAction = await dispatch(createTeacher(payload));
    setIsSubmitting(false);

    if (createTeacher.fulfilled.match(resultAction)) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} title="Add New Teacher" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" {...register('name')} placeholder="e.g. John Smith" />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
        </div>
        
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" {...register('email')} placeholder="teacher@example.com" />
          {errors.email && <span className="error-text">{errors.email.message}</span>}
        </div>
        
        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" {...register('phone')} placeholder="+1234567890" />
          {errors.phone && <span className="error-text">{errors.phone.message}</span>}
        </div>

        <div className="form-group">
          <label>Designation</label>
          <input type="text" {...register('designation')} placeholder="e.g. Senior Science Teacher" />
        </div>

        <div className="form-group">
          <label>Subjects Taught (comma separated)</label>
          <input type="text" {...register('subjectsTaught')} placeholder="e.g. Math, Physics" />
        </div>

        <div className="form-group">
          <label>Joining Date</label>
          <input type="date" {...register('joiningDate')} />
        </div>

        <div className="form-group">
          <label>Salary</label>
          <input type="number" {...register('salary')} placeholder="e.g. 50000" />
        </div>

        <div className="form-group">
          <label>Password (Optional)</label>
          <input type="password" {...register('password')} placeholder="Leave blank to auto-generate" />
          {errors.password && <span className="error-text">{errors.password.message}</span>}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add Teacher'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTeacherModal;
