import React from 'react';
import './EventBadge.css';

const EventBadge = ({ event }) => {
  const title = event?.title || 'Untitled';
  const badgeTitle = title.length > 18 ? `${title.slice(0, 18)}...` : title;

  return (
    <span className={`event-badge event-badge--${event.type || 'event'}`} title={title}>
      {badgeTitle}
    </span>
  );
};

export default EventBadge;
