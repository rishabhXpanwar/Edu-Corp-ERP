import React from 'react';
import { useFormContext } from 'react-hook-form';

const AdmissionStep1 = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="step-content">
      <h3>Student Profile</h3>
      <div className="form-group">
        <label>Full Name</label>
        <input type="text" {...register('student.name')} placeholder="e.g. John Doe" />
        {errors.student?.name && <span className="error-text">{errors.student.name.message}</span>}
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input type="email" {...register('student.email')} placeholder="student@example.com" />
        {errors.student?.email && <span className="error-text">{errors.student.email.message}</span>}
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input type="tel" {...register('student.phone')} placeholder="+1234567890" />
        {errors.student?.phone && <span className="error-text">{errors.student.phone.message}</span>}
      </div>
      <div className="form-group">
        <label>Password (Optional)</label>
        <input type="password" {...register('student.password')} placeholder="Leave blank to auto-generate" />
        {errors.student?.password && <span className="error-text">{errors.student.password.message}</span>}
      </div>
    </div>
  );
};

export default AdmissionStep1;
