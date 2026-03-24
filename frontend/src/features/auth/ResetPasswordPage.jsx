import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock } from 'lucide-react';
import { resetPasswordSchema } from './authSchemas.js';
import { resetPasswordThunk, clearError } from './authSlice.js';
import Spinner from '../../components/Spinner.jsx';
import './LoginPage.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    if (!token) return;
    dispatch(clearError());
    const resultAction = await dispatch(resetPasswordThunk({ token, newPassword: data.newPassword }));
    if (resetPasswordThunk.fulfilled.match(resultAction)) {
      navigate('/login');
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1>Invalid Link</h1>
            <p>Your password reset link is invalid or missing the token.</p>
          </div>
          <button type="button" className="submit-btn" onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Set New Password</h1>
          <p>Please enter your new password</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                id="newPassword" 
                placeholder="••••••••" 
                {...register('newPassword')}
              />
            </div>
            {errors.newPassword && (
              <span className="error-text">{errors.newPassword.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                id="confirmPassword" 
                placeholder="••••••••" 
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <Spinner size="sm" color="inherit" /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
