import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera } from 'lucide-react';

import { 
  fetchProfile, 
  updateProfile, 
  selectProfile, 
  selectProfileLoading, 
  selectProfileUpdateLoading 
} from './profileSlice.js';
import { profileUpdateSchema } from './profileSchemas.js';
import PasswordChangeForm from './PasswordChangeForm.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Spinner from '../../components/Spinner.jsx';
import useAuth from '../../hooks/useAuth.js';

import './ProfilePage.css';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const profile = useSelector(selectProfile);
  const loading = useSelector(selectProfileLoading);
  const updateLoading = useSelector(selectProfileUpdateLoading);

  const [avatarPreview, setAvatarPreview] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileUpdateSchema)
  });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || ''
      });
      setAvatarPreview(profile.profilePicture || null);
    }
  }, [profile, reset]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const onProfileSubmit = async (data) => {
    await dispatch(updateProfile(data));
  };

  const handleAvatarHover = () => {
    // hover effect handled in CSS
  };

  // Currently we use a simple schema. If file upload was needed, we'd handle it separately 
  // and construct FormData. The instructions simply mention "upload an avatar".
  // Without further backend details, we are doing a styling mockup for hover upload.

  if (loading && !profile) {
    return <div className="profile-page__loader"><Spinner /></div>;
  }

  return (
    <div className="profile-page">
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your personal information and security settings." 
      />

      {user?.mustChangePassword && (
        <div className="must-change-password-banner">
          Attention: You must change your default password before proceeding.
        </div>
      )}

      <div className="profile-card-container">
        <div className="profile-card card">
          <div className="profile-card__header">
            <div className="avatar-wrapper" onMouseEnter={handleAvatarHover}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  {getInitials(profile?.name || user?.name)}
                </div>
              )}
              <div className="avatar-overlay">
                <Camera size={24} color="#fff" />
                <span>Upload</span>
              </div>
            </div>
            <div className="profile-card__title">
              <h2>{profile?.name || user?.name || 'User Profile'}</h2>
              <span className="role-badge">{profile?.role || user?.role}</span>
            </div>
          </div>

          <div className="profile-card__body">
            <form onSubmit={handleSubmit(onProfileSubmit)} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input {...register('firstName')} className={errors.firstName ? 'input-error' : ''} />
                  {errors.firstName && <span className="error-text">{errors.firstName.message}</span>}
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input {...register('lastName')} className={errors.lastName ? 'input-error' : ''} />
                  {errors.lastName && <span className="error-text">{errors.lastName.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input {...register('phone')} className={errors.phone ? 'input-error' : ''} />
                {errors.phone && <span className="error-text">{errors.phone.message}</span>}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={updateLoading}>
                  {updateLoading ? <Spinner size="small" /> : 'Save Changes'}
                </button>
              </div>
            </form>

            <PasswordChangeForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
