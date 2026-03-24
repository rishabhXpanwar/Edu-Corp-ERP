import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordUpdateSchema } from './profileSchemas.js';
import { updatePassword, selectProfileUpdateLoading } from './profileSlice.js';
import Spinner from '../../components/Spinner.jsx';
import './PasswordChangeForm.css';

const PasswordChangeForm = () => {
  const dispatch = useDispatch();
  const updateLoading = useSelector(selectProfileUpdateLoading);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordUpdateSchema)
  });

  const onSubmit = async (data) => {
    const resultAction = await dispatch(updatePassword(data));
    if (updatePassword.fulfilled.match(resultAction)) {
      reset(); // Clear form on success
    }
  };

  return (
    <div className="password-change-form">
      <h3>Change Password</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="form-group">
          <label>Current Password *</label>
          <input 
            type="password" 
            {...register('currentPassword')} 
            className={errors.currentPassword ? 'input-error' : ''} 
          />
          {errors.currentPassword && <span className="error-text">{errors.currentPassword.message}</span>}
        </div>
        
        <div className="form-group">
          <label>New Password *</label>
          <input 
            type="password" 
            {...register('newPassword')} 
            className={errors.newPassword ? 'input-error' : ''} 
          />
          {errors.newPassword && <span className="error-text">{errors.newPassword.message}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={updateLoading}>
            {updateLoading ? <Spinner size="small" /> : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;
