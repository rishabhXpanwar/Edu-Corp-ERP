import React from 'react';
import './RouteCard.css';

const RouteCard = ({ route, onClick, isSelected }) => {
  const studentCount = route.assignedStudents?.length || 0;
  const stopCount = route.stops?.length || 0;

  return (
    <div
      className={`route-card ${isSelected ? 'route-card--selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="route-card__header">
        <h3 className="route-card__title">{route.routeName}</h3>
        <span className="route-card__vehicle">{route.vehicleNumber}</span>
      </div>

      <div className="route-card__driver">
        <span className="route-card__driver-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <span className="route-card__driver-name">{route.driverName}</span>
      </div>

      <div className="route-card__phone">
        <span className="route-card__phone-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </span>
        <span className="route-card__phone-number">{route.driverPhone}</span>
      </div>

      <div className="route-card__stats">
        <div className="route-card__stat">
          <span className="route-card__stat-value">{stopCount}</span>
          <span className="route-card__stat-label">Stops</span>
        </div>
        <div className="route-card__stat">
          <span className="route-card__stat-value">{studentCount}</span>
          <span className="route-card__stat-label">Students</span>
        </div>
      </div>

      <div className="route-card__footer">
        <span className="route-card__view-hint">Click to view details</span>
      </div>
    </div>
  );
};

export default RouteCard;
