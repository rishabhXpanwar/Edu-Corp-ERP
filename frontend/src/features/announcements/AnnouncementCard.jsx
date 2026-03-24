import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';
import { deleteAnnouncement, selectAnnouncementLoading } from './announcementSlice.js';
import './AnnouncementCard.css';

const AUDIENCE_LABELS = {
  all: 'All',
  staff: 'Staff',
  students: 'Students',
};

const formatRelativeTime = (value) => {
  if (!value) {
    return '-';
  }

  const now = new Date();
  const date = new Date(value);
  const diffMs = now.getTime() - date.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return date.toLocaleString();
  }

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
};

const AnnouncementCard = ({ announcement, currentUserId, currentRole }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAnnouncementLoading);
  const [isExpanded, setIsExpanded] = useState(false);

  const authorId = useMemo(
    () => announcement.authorId?._id || announcement.authorId,
    [announcement.authorId],
  );

  const authorName = useMemo(
    () => announcement.authorId?.name || 'Unknown author',
    [announcement.authorId],
  );

  const canDelete = useMemo(
    () => currentRole === 'principal' || String(authorId) === String(currentUserId),
    [currentRole, authorId, currentUserId],
  );

  const bodyText = announcement.body || '';
  const isLongBody = bodyText.length > 100;

  const handleDelete = async () => {
    await dispatch(deleteAnnouncement(announcement._id));
  };

  return (
    <motion.article layout className="announcement-card">
      <div className="announcement-card__header">
        <div className="announcement-card__meta">
          <span className={`announcement-card__audience announcement-card__audience--${announcement.audience}`}>
            {AUDIENCE_LABELS[announcement.audience] || 'All'}
          </span>
          <span className="announcement-card__author">by {authorName}</span>
          <span className="announcement-card__time">{formatRelativeTime(announcement.createdAt)}</span>
        </div>

        {canDelete && (
          <button
            type="button"
            className="announcement-card__delete-btn"
            onClick={handleDelete}
            disabled={loading}
            aria-label="Delete announcement"
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>

      <h3 className="announcement-card__title">{announcement.title}</h3>

      <motion.div
        layout
        className="announcement-card__body-wrap"
        animate={{ height: isExpanded || !isLongBody ? 'auto' : '4.5rem' }}
        transition={{ duration: 0.2 }}
      >
        <p className="announcement-card__body">
          {isExpanded || !isLongBody ? bodyText : bodyText.slice(0, 100)}
          {!isExpanded && isLongBody ? '...' : ''}
        </p>
      </motion.div>

      {isLongBody && (
        <button
          type="button"
          className="announcement-card__toggle-btn"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </motion.article>
  );
};

export default AnnouncementCard;
