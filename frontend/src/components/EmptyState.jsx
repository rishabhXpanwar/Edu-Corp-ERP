import React from 'react';
import './EmptyState.css';

const EmptyState = ({
  icon = '📋',
  title,
  subtitle,
  description,
  message,
  action,
  actionText = 'Take Action',
}) => {
  const resolvedSubtitle = subtitle || description || message;

  const renderAction = () => {
    if (!action) {
      return null;
    }

    if (typeof action === 'function') {
      return (
        <button type="button" className="btn btn-primary" onClick={action}>
          {actionText}
        </button>
      );
    }

    return action;
  };

  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      {resolvedSubtitle && <p className="empty-state__subtitle">{resolvedSubtitle}</p>}
      {action && <div className="empty-state__action">{renderAction()}</div>}
    </div>
  );
};

export default EmptyState;
