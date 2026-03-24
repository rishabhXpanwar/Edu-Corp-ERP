import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotPasswordSchema } from './authSchemas.js';
import { forgotPasswordThunk, clearError } from './authSlice.js';
import Spinner from '../../components/Spinner.jsx';
import './LoginPage.css'; 
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    dispatch(clearError());
    const resultAction = await dispatch(forgotPasswordThunk(data));
    if (forgotPasswordThunk.fulfilled.match(resultAction)) {
      setSubmitted(true);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>

        {!submitted ? (
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  id="email" 
                  placeholder="name@example.com" 
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <span className="error-text">{errors.email.message}</span>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <Spinner size="sm" color="inherit" /> : 'Send Reset Link'}
            </button>
            <button type="button" className="link-btn back-btn" onClick={() => navigate('/login')}>
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        ) : (
          <div className="success-state">
            <Mail className="success-icon" size={48} />
            <h2>Check your email</h2>
            <p>We've sent a password reset link to your email address.</p>
            <button type="button" className="submit-btn outline" onClick={() => navigate('/login')}>
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
