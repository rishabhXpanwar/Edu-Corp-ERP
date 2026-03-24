import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '../../components/DataTable.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Spinner from '../../components/Spinner.jsx';
import ComposeNotificationForm from './ComposeNotificationForm.jsx';
import NotificationInbox from './NotificationInbox.jsx';
import {
  fetchNotifications,
  fetchUnreadCount,
  selectNotifError,
  selectNotifLoading,
  selectNotifications,
  selectNotifPagination,
} from './notificationSlice.js';
import './NotificationsPage.css';

const SENDER_ROLES = ['teacher', 'principal', 'academicManager', 'adminManager', 'hrManager', 'financeManager'];

const truncate = (text, max = 60) => {
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

const getRecipientLabel = (notification) => {
  if (notification.type === 'individual') {
    return notification.recipientId?.name || notification.recipientId || 'Individual';
  }

  if (notification.type === 'section' || notification.type === 'class') {
    const className = notification.classId?.name || notification.classId || 'Class';
    const sectionName = notification.sectionId?.name || notification.sectionId;
    
    if (sectionName && sectionName !== 'all') {
      return `${className} - ${sectionName}`;
    }
    
    return className;
  }

  return '-';
};

const NotificationsPage = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotifLoading);
  const error = useSelector(selectNotifError);
  const pagination = useSelector(selectNotifPagination);

  const [currentPage, setCurrentPage] = useState(1);

  const isSenderView = useMemo(
    () => SENDER_ROLES.includes(user?.role),
    [user?.role],
  );

  useEffect(() => {
    dispatch(fetchNotifications({ page: currentPage, limit: 20 }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const refreshNotifications = () => {
    dispatch(fetchNotifications({ page: currentPage, limit: 20 }));
  };

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <span className={`notif-type-badge notif-type-badge--${value || 'individual'}`}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'message',
      label: 'Message',
      render: (value) => truncate(value, 60),
    },
    {
      key: 'recipient',
      label: 'Recipient',
      render: (_, row) => getRecipientLabel(row),
    },
    {
      key: 'createdAt',
      label: 'Sent',
      render: (value) => formatRelativeTime(value),
    },
  ];

  const errorMessage = typeof error === 'string' ? error : error?.message;

  if (loading && notifications.length === 0) {
    return (
      <div className="notifications-page school-panel">
        <PageHeader title="Notifications" subtitle="Communication updates and alerts" />
        <div className="notifications-page__loading">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page school-panel">
      <PageHeader
        title="Notifications"
        subtitle={
          isSenderView
            ? 'Send updates and review your sent notifications'
            : 'Track messages sent to you'
        }
      />

      {errorMessage && <div className="notifications-page__error">{errorMessage}</div>}

      {isSenderView ? (
        <div className="notifications-page__sender-view">
          <ComposeNotificationForm onSent={refreshNotifications} />

          <section className="notifications-page__history">
            {notifications.length === 0 && !loading ? (
              <EmptyState title="No notifications yet" subtitle="Your sent notifications will appear here" />
            ) : (
              <DataTable
                columns={columns}
                data={notifications}
                loading={loading}
                emptyText="No notifications yet"
              />
            )}
          </section>
        </div>
      ) : (
        <NotificationInbox onPageChange={setCurrentPage} />
      )}

      {!isSenderView && pagination.totalPages > 1 && (
        <div className="notifications-page__page-note">Page {pagination.page} of {pagination.totalPages}</div>
      )}
    </div>
  );
};

export default NotificationsPage;
