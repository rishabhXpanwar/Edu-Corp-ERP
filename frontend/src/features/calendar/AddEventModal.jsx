import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../components/Modal.jsx';
import { createEventSchema } from './calendarSchemas.js';
import { createEvent } from './calendarSlice.js';
import './AddEventModal.css';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const AddEventModal = ({ isOpen, onClose, defaultDate = '' }) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.calendar.loading);

  const [formData, setFormData] = useState({
    title: '',
    type: 'event',
    startDate: defaultDate || getTodayDate(),
    endDate: defaultDate || getTodayDate(),
    description: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const initialDate = defaultDate || getTodayDate();
    setFormData({
      title: '',
      type: 'event',
      startDate: initialDate,
      endDate: initialDate,
      description: '',
    });
    setFieldErrors({});
  }, [isOpen, defaultDate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const parseResult = createEventSchema.safeParse(formData);
    if (!parseResult.success) {
      const nextErrors = {};
      parseResult.error.issues.forEach((issue) => {
        const field = issue.path?.[0];
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      });
      setFieldErrors(nextErrors);
      return;
    }

    const payload = {
      title: formData.title.trim(),
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description.trim(),
    };

    const actionResult = await dispatch(createEvent(payload));
    if (createEvent.fulfilled.match(actionResult)) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Event" maxWidth="640px">
      <form className="add-event-modal" onSubmit={handleSubmit}>
        <div className="add-event-modal__field">
          <label htmlFor="event-title">Title</label>
          <input
            id="event-title"
            name="title"
            type="text"
            maxLength={200}
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
          />
          {fieldErrors.title && <span className="add-event-modal__error">{fieldErrors.title}</span>}
        </div>

        <div className="add-event-modal__field">
          <label htmlFor="event-type">Type</label>
          <select
            id="event-type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="holiday">Holiday</option>
            <option value="exam">Exam</option>
            <option value="event">Event</option>
          </select>
          {fieldErrors.type && <span className="add-event-modal__error">{fieldErrors.type}</span>}
        </div>

        <div className="add-event-modal__row">
          <div className="add-event-modal__field">
            <label htmlFor="event-start-date">Start Date</label>
            <input
              id="event-start-date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              disabled={loading}
            />
            {fieldErrors.startDate && <span className="add-event-modal__error">{fieldErrors.startDate}</span>}
          </div>

          <div className="add-event-modal__field">
            <label htmlFor="event-end-date">End Date</label>
            <input
              id="event-end-date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              disabled={loading}
            />
            {fieldErrors.endDate && <span className="add-event-modal__error">{fieldErrors.endDate}</span>}
          </div>
        </div>

        <div className="add-event-modal__field">
          <label htmlFor="event-description">Description</label>
          <textarea
            id="event-description"
            name="description"
            rows={4}
            maxLength={1000}
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
          />
          {fieldErrors.description && <span className="add-event-modal__error">{fieldErrors.description}</span>}
        </div>

        <div className="add-event-modal__actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEventModal;
