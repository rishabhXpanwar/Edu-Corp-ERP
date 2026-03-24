import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import Spinner from '../../components/Spinner.jsx';
import {
  fetchUnreadCount,
  markNotificationsRead,
  selectNotifLoading,
  selectNotifPagination,
  selectNotifications,
} from './notificationSlice.js';
import './NotificationInbox.css';

const truncate = (text, max = 80) => {
  if (!text) {
    return '';
  }

  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max)}...`;
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

const NotificationInbox = ({ onPageChange }) => {
  const dispatch = useDispatch();

  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotifLoading);
  const pagination = useSelector(selectNotifPagination);

  const handleMarkRead = async (notificationId) => {
    const resultAction = await dispatch(markNotificationsRead([notificationId]));

    if (markNotificationsRead.fulfilled.match(resultAction)) {
      dispatch(fetchUnreadCount());
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="notification-inbox__loading">
        <Spinner />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications yet"
        subtitle="You have no received notifications at the moment"
      />
    );
  }

  return (
    <div className="notification-inbox">
      <div className="notification-inbox__list">
        {notifications.map((notification) => (
          <article
            key={notification._id}
            className={`notification-row ${notification.isRead ? 'notification-row--read' : 'notification-row--unread'}`}
          >
            <div className="notification-row__content">
              <p className="notification-row__sender">
                {notification.senderId?.name || notification.senderName || 'Unknown sender'}
              </p>
              <p className="notification-row__message">{truncate(notification.message, 80)}</p>
            </div>

            <div className="notification-row__meta">
              <span className="notification-row__time">{formatRelativeTime(notification.createdAt)}</span>

              {!notification.isRead && (
                <button
                  type="button"
                  className="notification-row__read-btn"
                  onClick={() => handleMarkRead(notification._id)}
                  disabled={loading}
                >
                  Mark Read
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          perPage={pagination.limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default NotificationInbox;
