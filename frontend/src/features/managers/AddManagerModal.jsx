import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createManager } from './managerSlice.js';
import Modal from '../../components/Modal.jsx';

const phoneRegex = /^[0-9+\-\s()]+$/;

const managerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required').min(1, 'Email is required'),
  phone: z.string().regex(phoneRegex, 'Valid phone is required').min(1, 'Phone is required'),
  role: z.enum(['financeManager', 'hrManager', 'academicManager', 'adminManager'], {
    errorMap: () => ({ message: 'You must select a role' })
  }),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  salary: z.coerce.number().optional()
});

const AddManagerModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(managerSchema),
    defaultValues: { name: '', email: '', phone: '', role: '', password: '', designation: '', joiningDate: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const payload = { ...data };
    
    if (!payload.password) delete payload.password;
    if (!payload.salary) delete payload.salary;
    if (!payload.joiningDate) delete payload.joiningDate;

    const resultAction = await dispatch(createManager(payload));
    setIsSubmitting(false);

    if (createManager.fulfilled.match(resultAction)) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} title="Add New Manager" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" {...register('name')} placeholder="e.g. Alice Jones" />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
        </div>
        
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" {...register('email')} placeholder="manager@example.com" />
          {errors.email && <span className="error-text">{errors.email.message}</span>}
        </div>
        
        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" {...register('phone')} placeholder="+1234567890" />
          {errors.phone && <span className="error-text">{errors.phone.message}</span>}
        </div>

        <div className="form-group">
          <label>Role</label>
          <select {...register('role')}>
             <option value="">Select Role...</option>
             <option value="financeManager">Finance Manager</option>
             <option value="hrManager">HR Manager</option>
             <option value="academicManager">Academic Manager</option>
             <option value="adminManager">Admin Manager</option>
          </select>
          {errors.role && <span className="error-text">{errors.role.message}</span>}
        </div>

        <div className="form-group">
          <label>Designation (Internal title)</label>
          <input type="text" {...register('designation')} placeholder="e.g. Lead Accountant" />
        </div>

        <div className="form-group">
          <label>Joining Date</label>
          <input type="date" {...register('joiningDate')} />
        </div>

        <div className="form-group">
          <label>Salary</label>
          <input type="number" {...register('salary')} placeholder="e.g. 60000" />
        </div>

        <div className="form-group">
          <label>Password (Optional)</label>
          <input type="password" {...register('password')} placeholder="Leave blank to auto-generate" />
          {errors.password && <span className="error-text">{errors.password.message}</span>}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add Manager'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddManagerModal;
