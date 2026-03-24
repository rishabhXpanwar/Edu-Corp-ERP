import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendNotificationSchema } from './notificationSchemas.js';
import { sendNotification } from './notificationSlice.js';
import { fetchClasses } from '../classes/classSlice.js';
import './ComposeNotificationForm.css';

const NOTIFICATION_TYPES = ['individual', 'class'];

const initialFormState = {
  type: 'individual',
  admissionNumber: '',
  classId: '',
  sectionId: '',
  message: '',
};

const ComposeNotificationForm = ({ onSent }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.notification);
  const { classes } = useSelector((state) => state.classes);

  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch classes on mount
  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  const messageLength = useMemo(() => formData.message.length, [formData.message]);

  // Get sections for selected class
  const selectedClassSections = useMemo(() => {
    if (!formData.classId) return [];
    const selectedClass = classes.find((c) => c._id === formData.classId);
    return selectedClass?.sections || [];
  }, [formData.classId, classes]);

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      admissionNumber: '',
      classId: '',
      sectionId: '',
    }));
    setFieldErrors({});
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // Reset sectionId when classId changes
    if (name === 'classId') {
      setFormData((prev) => ({
        ...prev,
        classId: value,
        sectionId: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const parseResult = sendNotificationSchema.safeParse(formData);
    if (!parseResult.success) {
      const nextErrors = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path?.[0];
        if (fieldName && !nextErrors[fieldName]) {
          nextErrors[fieldName] = issue.message;
        }
      });
      setFieldErrors(nextErrors);
      return;
    }

    const payload = {
      type: formData.type,
      message: formData.message.trim(),
    };

    if (formData.type === 'individual') {
      payload.admissionNumber = formData.admissionNumber.trim();
    }

    if (formData.type === 'class') {
      payload.classId = formData.classId;
      if (formData.sectionId && formData.sectionId !== 'all') {
        payload.sectionId = formData.sectionId;
      }
    }

    console.log('[ComposeNotificationForm] Submitting payload:', payload);

    const resultAction = await dispatch(sendNotification(payload));
    if (sendNotification.fulfilled.match(resultAction)) {
      setFormData((prev) => ({
        ...prev,
        admissionNumber: '',
        classId: '',
        sectionId: '',
        message: '',
      }));
      setFieldErrors({});

      if (onSent) {
        onSent();
      }
    }
  };

  return (
    <section className="compose-notification" aria-label="Compose notification form">
      <h2 className="compose-notification__title">Compose Notification</h2>

      <div className="compose-notification__type-toggle" role="tablist" aria-label="Notification scope">
        {NOTIFICATION_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={`compose-notification__type-btn ${formData.type === type ? 'is-active' : ''}`}
            onClick={() => handleTypeChange(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <form className="compose-notification__form" onSubmit={handleSubmit}>
        {formData.type === 'individual' && (
          <div className="compose-notification__field">
            <label htmlFor="admissionNumber">Student Admission Number</label>
            <input
              id="admissionNumber"
              name="admissionNumber"
              type="text"
              value={formData.admissionNumber}
              onChange={handleInputChange}
              placeholder="Enter student admission number"
            />
            {fieldErrors.admissionNumber && (
              <span className="compose-notification__error">{fieldErrors.admissionNumber}</span>
            )}
          </div>
        )}

        {formData.type === 'class' && (
          <>
            <div className="compose-notification__field">
              <label htmlFor="classId">Class</label>
              <select
                id="classId"
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
              >
                <option value="">Select a class</option>
                {classes.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
              {fieldErrors.classId && (
                <span className="compose-notification__error">{fieldErrors.classId}</span>
              )}
            </div>

            <div className="compose-notification__field">
              <label htmlFor="sectionId">Section</label>
              <select
                id="sectionId"
                name="sectionId"
                value={formData.sectionId}
                onChange={handleInputChange}
                disabled={!formData.classId}
              >
                <option value="">Select a section</option>
                <option value="all">All Sections</option>
                {selectedClassSections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.name}
                  </option>
                ))}
              </select>
              {fieldErrors.sectionId && (
                <span className="compose-notification__error">{fieldErrors.sectionId}</span>
              )}
            </div>
          </>
        )}

        <div className="compose-notification__field">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={1000}
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Write your message here"
          />
          <div className="compose-notification__meta">
            {fieldErrors.message && (
              <span className="compose-notification__error">{fieldErrors.message}</span>
            )}
            <span className="compose-notification__counter">{messageLength} / 1000</span>
          </div>
        </div>

        <div className="compose-notification__actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ComposeNotificationForm;
