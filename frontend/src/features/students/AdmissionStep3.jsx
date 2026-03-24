import React from 'react';
import { useFormContext } from 'react-hook-form';

const AdmissionStep3 = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="step-content">
      <h3>Parent / Guardian Details</h3>
      <div className="form-group">
        <label>Full Name</label>
        <input type="text" {...register('parent.name')} placeholder="e.g. Jane Doe" />
        {errors.parent?.name && <span className="error-text">{errors.parent.name.message}</span>}
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input type="email" {...register('parent.email')} placeholder="parent@example.com" />
        {errors.parent?.email && <span className="error-text">{errors.parent.email.message}</span>}
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input type="tel" {...register('parent.phone')} placeholder="+1234567890" />
        {errors.parent?.phone && <span className="error-text">{errors.parent.phone.message}</span>}
      </div>
      <div className="form-group">
        <label>Password (Optional)</label>
        <input type="password" {...register('parent.password')} placeholder="Leave blank to auto-generate" />
        {errors.parent?.password && <span className="error-text">{errors.parent.password.message}</span>}
      </div>
    </div>
  );
};

export default AdmissionStep3;
