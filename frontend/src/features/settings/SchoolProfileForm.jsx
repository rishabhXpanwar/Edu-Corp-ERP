import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera } from 'lucide-react';
import Spinner from '../../components/Spinner.jsx';
import { settingsSchema } from './settingsSchemas.js';
import { selectUpdateLoading, updateSettings } from './settingsSlice.js';
import './SchoolProfileForm.css';

const SchoolProfileForm = ({ school }) => {
  const dispatch = useDispatch();
  const updateLoading = useSelector(selectUpdateLoading);
  const fileInputRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: school?.name || '',
      address: school?.address || '',
      phone: school?.phone || '',
      email: school?.email || '',
    },
  });

  useEffect(() => {
    reset({
      name: school?.name || '',
      address: school?.address || '',
      phone: school?.phone || '',
      email: school?.email || '',
    });
    setLogoFile(null);
    setLogoPreview('');
  }, [school, reset]);

  useEffect(() => () => {
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
  }, [logoPreview]);

  const initials = useMemo(() => {
    const source = school?.name?.trim();
    if (!source) {
      return 'SC';
    }

    const parts = source.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'SC';
  }, [school?.name]);

  const handlePickLogo = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(previewUrl);
  };

  const onSubmit = (values) => {
    const formData = new FormData();

    if (dirtyFields.name && values.name?.trim()) {
      formData.append('name', values.name.trim());
    }
    if (dirtyFields.address && values.address?.trim()) {
      formData.append('address', values.address.trim());
    }
    if (dirtyFields.phone && values.phone?.trim()) {
      formData.append('phone', values.phone.trim());
    }
    if (dirtyFields.email && values.email?.trim()) {
      formData.append('email', values.email.trim());
    }

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    dispatch(updateSettings(formData));
  };

  return (
    <section className="settings-card" aria-label="School profile settings">
      <div className="settings-logo-block">
        <button
          className="settings-logo-picker"
          type="button"
          onClick={handlePickLogo}
          aria-label="Upload school logo"
        >
          {logoPreview || school?.logo ? (
            <img src={logoPreview || school.logo} alt="School logo" className="settings-logo-image" />
          ) : (
            <span className="settings-logo-initials">{initials}</span>
          )}
          <span className="settings-logo-overlay">
            <Camera size={20} />
            <span>Upload</span>
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="settings-logo-input"
          onChange={handleLogoChange}
        />
      </div>

      <p className="settings-info-banner">Changes here affect your entire school's display.</p>

      <form className="settings-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="settings-form-group" htmlFor="settings-name">
          <span>Name</span>
          <input id="settings-name" type="text" {...register('name')} />
          {errors.name ? <span className="field-error">{errors.name.message}</span> : null}
        </label>

        <label className="settings-form-group" htmlFor="settings-address">
          <span>Address</span>
          <input id="settings-address" type="text" {...register('address')} />
          {errors.address ? <span className="field-error">{errors.address.message}</span> : null}
        </label>

        <label className="settings-form-group" htmlFor="settings-phone">
          <span>Phone</span>
          <input id="settings-phone" type="text" {...register('phone')} />
          {errors.phone ? <span className="field-error">{errors.phone.message}</span> : null}
        </label>

        <label className="settings-form-group" htmlFor="settings-email">
          <span>Email</span>
          <input id="settings-email" type="email" {...register('email')} />
          {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
        </label>

        <button className="settings-save-button" type="submit" disabled={updateLoading}>
          {updateLoading ? <Spinner size="sm" label="Saving settings" /> : 'Save Changes'}
        </button>
      </form>
    </section>
  );
};

export default SchoolProfileForm;
