import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Phone, Lock, Key } from 'lucide-react';
import { emailLoginSchema, otpRequestSchema, otpLoginSchema } from './authSchemas.js';
import { loginEmail, sendOtpToken, loginOtp, clearError } from './authSlice.js';
import { ROLES } from '../../constants/roles.js';
import Spinner from '../../components/Spinner.jsx';
import './LoginPage.css';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('email'); // 'email' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === ROLES.SUPER_ADMIN) {
        navigate('/superadmin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const emailForm = useForm({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const otpRequestForm = useForm({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { phone: '' },
  });

  const otpSubmitForm = useForm({
    resolver: zodResolver(otpLoginSchema),
    defaultValues: { phone: '', otp: '' },
  });

  const handleRouteOnSuccess = (user) => {
    if (user?.role === ROLES.SUPER_ADMIN) {
      navigate('/superadmin/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const onEmailSubmit = async (data) => {
    dispatch(clearError());
    const resultAction = await dispatch(loginEmail(data));
    if (loginEmail.fulfilled.match(resultAction)) {
      handleRouteOnSuccess(resultAction.payload);
    }
  };

  const onOtpRequest = async (data) => {
    dispatch(clearError());
    const resultAction = await dispatch(sendOtpToken(data));
    if (sendOtpToken.fulfilled.match(resultAction)) {
      setOtpSent(true);
      otpSubmitForm.setValue('phone', data.phone);
    }
  };

  const onOtpSubmit = async (data) => {
    dispatch(clearError());
    const resultAction = await dispatch(loginOtp(data));
    if (loginOtp.fulfilled.match(resultAction)) {
      handleRouteOnSuccess(resultAction.payload);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Login to your account to continue</p>
        </div>

        <div className="login-tabs">
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => { setActiveTab('email'); dispatch(clearError()); }}
          >
            Email
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'otp' ? 'active' : ''}`}
            onClick={() => { setActiveTab('otp'); dispatch(clearError()); }}
          >
            Phone (OTP)
          </button>
        </div>

        {activeTab === 'email' && (
          <form className="login-form email-form" onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  id="email" 
                  placeholder="name@example.com" 
                  {...emailForm.register('email')}
                />
              </div>
              {emailForm.formState.errors.email && (
                <span className="error-text">{emailForm.formState.errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <div className="label-with-link">
                <label htmlFor="password">Password</label>
                <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} className="forgot-link">Forgot?</a>
              </div>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  {...emailForm.register('password')}
                />
              </div>
              {emailForm.formState.errors.password && (
                <span className="error-text">{emailForm.formState.errors.password.message}</span>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <Spinner size="sm" color="inherit" /> : 'Login'}
            </button>
          </form>
        )}

        {activeTab === 'otp' && !otpSent && (
          <form className="login-form otp-request-form" onSubmit={otpRequestForm.handleSubmit(onOtpRequest)}>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={18} />
                <input 
                  type="text" 
                  id="phone" 
                  placeholder="+1234567890" 
                  {...otpRequestForm.register('phone')}
                />
              </div>
              {otpRequestForm.formState.errors.phone && (
                <span className="error-text">{otpRequestForm.formState.errors.phone.message}</span>
              )}
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <Spinner size="sm" color="inherit" /> : 'Send OTP'}
            </button>
          </form>
        )}

        {activeTab === 'otp' && otpSent && (
          <form className="login-form otp-submit-form" onSubmit={otpSubmitForm.handleSubmit(onOtpSubmit)}>
            <div className="form-group">
              <div className="label-with-link">
                <label htmlFor="otp">Enter Verification Code</label>
                <button type="button" className="link-btn" onClick={() => setOtpSent(false)}>Change phone</button>
              </div>
              <div className="input-with-icon">
                <Key className="input-icon" size={18} />
                <input 
                  type="text" 
                  id="otp" 
                  placeholder="123456" 
                  maxLength={6}
                  {...otpSubmitForm.register('otp')}
                />
              </div>
              {otpSubmitForm.formState.errors.otp && (
                <span className="error-text">{otpSubmitForm.formState.errors.otp.message}</span>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <Spinner size="sm" color="inherit" /> : 'Verify & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
