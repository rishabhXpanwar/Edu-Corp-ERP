import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../components/Modal.jsx';
import { createAnnouncementSchema } from './announcementSchemas.js';
import { clearAnnouncementError, createAnnouncement } from './announcementSlice.js';
import './PostAnnouncementModal.css';

const initialFormState = {
  title: '',
  audience: 'all',
  body: '',
};

const PostAnnouncementModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.announcement);

  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    dispatch(clearAnnouncementError());
    setFieldErrors({});
  }, [dispatch, isOpen]);

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

    const parseResult = createAnnouncementSchema.safeParse(formData);
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
      audience: formData.audience,
      body: formData.body.trim(),
    };

    const resultAction = await dispatch(createAnnouncement(payload));
    if (createAnnouncement.fulfilled.match(resultAction)) {
      setFormData(initialFormState);
      setFieldErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Announcement" maxWidth="620px">
      <form className="post-announcement-modal" onSubmit={handleSubmit}>
        {error && <div className="post-announcement-modal__error">{error}</div>}

        <div className="post-announcement-modal__field">
          <label htmlFor="announcement-title">Title</label>
          <input
            id="announcement-title"
            name="title"
            type="text"
            maxLength={200}
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
          />
          {fieldErrors.title && <span className="post-announcement-modal__field-error">{fieldErrors.title}</span>}
        </div>

        <div className="post-announcement-modal__field">
          <label htmlFor="announcement-audience">Audience</label>
          <select
            id="announcement-audience"
            name="audience"
            value={formData.audience}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="all">All</option>
            <option value="staff">Staff</option>
            <option value="students">Students</option>
          </select>
          {fieldErrors.audience && (
            <span className="post-announcement-modal__field-error">{fieldErrors.audience}</span>
          )}
        </div>

        <div className="post-announcement-modal__field">
          <label htmlFor="announcement-body">Body</label>
          <textarea
            id="announcement-body"
            name="body"
            rows={6}
            maxLength={5000}
            value={formData.body}
            onChange={handleChange}
            disabled={loading}
          />
          {fieldErrors.body && <span className="post-announcement-modal__field-error">{fieldErrors.body}</span>}
        </div>

        <div className="post-announcement-modal__actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Posting...' : 'Post Announcement'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PostAnnouncementModal;
