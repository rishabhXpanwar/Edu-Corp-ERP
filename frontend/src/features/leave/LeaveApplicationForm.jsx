import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyLeaveSchema } from './leaveSchemas';
import { applyLeave, fetchMyLeaveHistory } from './leaveSlice';
import FileUploader from '../../components/FileUploader';

const LeaveApplicationForm = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.leave);
  const [uploadedAttachment, setUploadedAttachment] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      type: 'sick',
      startDate: '',
      endDate: '',
      reason: '',
      attachmentUrl: '',
    },
  });

  const attachmentUrl = watch('attachmentUrl');

  const handleUploadSuccess = (fileData) => {
    setUploadedAttachment(fileData.name || 'Attachment uploaded');
    setValue('attachmentUrl', fileData.url, { shouldValidate: true });
  };

  const onSubmit = async (values) => {
    const payload = {
      type: values.type,
      startDate: values.startDate,
      endDate: values.endDate,
      reason: values.reason.trim(),
      attachmentUrl: values.attachmentUrl || undefined,
    };

    const resultAction = await dispatch(applyLeave(payload));
    if (applyLeave.fulfilled.match(resultAction)) {
      reset();
      setUploadedAttachment('');
      dispatch(fetchMyLeaveHistory({ page: 1, limit: 20 }));
    }
  };

  return (
    <form className="leave-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="leave-form__row leave-form__row--double">
        <div className="leave-form__field">
          <label htmlFor="leave-type" className="leave-form__label">Leave Type</label>
          <select
            id="leave-type"
            className="leave-form__input"
            disabled={loading}
            {...register('type')}
          >
            <option value="sick">Sick</option>
            <option value="casual">Casual</option>
            <option value="maternity">Maternity</option>
            <option value="other">Other</option>
          </select>
          {errors.type && <span className="leave-form__error">{errors.type.message}</span>}
        </div>

        <div className="leave-form__field">
          <label htmlFor="leave-start-date" className="leave-form__label">Start Date</label>
          <input
            id="leave-start-date"
            type="date"
            className="leave-form__input"
            disabled={loading}
            {...register('startDate')}
          />
          {errors.startDate && <span className="leave-form__error">{errors.startDate.message}</span>}
        </div>

        <div className="leave-form__field">
          <label htmlFor="leave-end-date" className="leave-form__label">End Date</label>
          <input
            id="leave-end-date"
            type="date"
            className="leave-form__input"
            disabled={loading}
            {...register('endDate')}
          />
          {errors.endDate && <span className="leave-form__error">{errors.endDate.message}</span>}
        </div>
      </div>

      <div className="leave-form__field">
        <label htmlFor="leave-reason" className="leave-form__label">Reason</label>
        <textarea
          id="leave-reason"
          className="leave-form__input leave-form__textarea"
          placeholder="Describe the reason for your leave request"
          disabled={loading}
          {...register('reason')}
        />
        {errors.reason && <span className="leave-form__error">{errors.reason.message}</span>}
      </div>

      <div className="leave-form__field">
        <label className="leave-form__label">Attachment (optional)</label>
        <FileUploader
          label="Upload supporting file"
          onUploadSuccess={handleUploadSuccess}
        />
        {uploadedAttachment && (
          <span className="leave-form__hint">Attached: {uploadedAttachment}</span>
        )}
        {attachmentUrl && !uploadedAttachment && (
          <span className="leave-form__hint">Attachment URL set</span>
        )}
        {errors.attachmentUrl && (
          <span className="leave-form__error">{errors.attachmentUrl.message}</span>
        )}
      </div>

      <div className="leave-form__actions">
        <button
          type="submit"
          className="leave-form__button"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Leave Request'}
        </button>
      </div>
    </form>
  );
};

export default LeaveApplicationForm;
