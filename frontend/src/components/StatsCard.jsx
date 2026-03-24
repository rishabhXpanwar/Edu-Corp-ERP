import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, trend, trendValue, accentColor = 'var(--school-primary)' }) => {
  return (
    <div className="stats-card">
      <div className="stats-card__icon-wrap" style={{ background: accentColor + '20' }}>
        <span className="stats-card__icon" style={{ color: accentColor }}>{icon}</span>
      </div>
      <div className="stats-card__content">
        <p className="stats-card__title">{title}</p>
        <p className="stats-card__value">{value}</p>
        {trend && (
          <p className={`stats-card__trend stats-card__trend--${trend}`}>
            {trendValue}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
