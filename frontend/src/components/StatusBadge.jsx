import React from 'react';
import './StatusBadge.css';

const TYPE_TO_VARIANT = {
  green: 'success',
  red: 'danger',
  amber: 'warning',
  yellow: 'warning',
  gray: 'neutral',
  grey: 'neutral',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  neutral: 'neutral',
};

const normalize = (value) => String(value ?? '').trim().toLowerCase();

const StatusBadge = ({ status, variant = 'custom', label, type }) => {
  let resolvedVariant = variant;

  if (variant === 'custom') {
    const typedVariant = TYPE_TO_VARIANT[normalize(type)];
    if (typedVariant) {
      resolvedVariant = typedVariant;
    }

    const s = normalize(status);
    if (['paid', 'active', 'approved', 'present', 'returned'].includes(s)) resolvedVariant = 'success';
    else if (['unpaid', 'absent', 'cancelled', 'rejected', 'expired'].includes(s)) resolvedVariant = 'danger';
    else if (['overdue', 'late', 'pending'].includes(s)) resolvedVariant = 'warning';
    else if (['true', 'enabled'].includes(s)) resolvedVariant = 'success';
    else if (['false', 'disabled'].includes(s)) resolvedVariant = 'danger';
    else resolvedVariant = 'neutral';
  }

  const text = label ?? (status === undefined || status === null || status === '' ? 'Unknown' : String(status));

  return (
    <span className={`status-badge status-badge--${resolvedVariant}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
