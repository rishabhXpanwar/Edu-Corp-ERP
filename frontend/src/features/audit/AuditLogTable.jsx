import React, { useMemo } from 'react';
import DataTable from '../../components/DataTable.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import './AuditLogTable.css';

const TARGET_MODEL_OPTIONS = [
  'User',
  'Fee',
  'Salary',
  'LeaveRequest',
  'LibraryBook',
  'Transport',
  'Announcement',
  'Assignment',
  'Class',
  'Section',
  'Exam',
  'Marks',
  'Subscription',
  'School',
  'CalendarEvent',
  'AuditLog',
];

const getRelativeTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return date.toLocaleDateString();
  }

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
};

const truncateTargetId = (targetId) => {
  if (!targetId) {
    return '-';
  }

  const idString = String(targetId);
  if (idString.length <= 12) {
    return idString;
  }

  return `${idString.slice(0, 12)}...`;
};

const toIsoOrEmpty = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString();
};

const AuditLogTable = ({
  logs,
  loading,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}) => {
  const columns = useMemo(() => {
    return [
      {
        key: 'createdAt',
        label: 'Time',
        width: '14%',
        render: (value) => {
          return (
            <span className="audit-log-table__time" title={toIsoOrEmpty(value)}>
              {getRelativeTime(value)}
            </span>
          );
        },
      },
      {
        key: 'actor',
        label: 'Actor',
        width: '24%',
        render: (_, row) => (
          <div className="audit-log-table__actor">
            <span className="audit-log-table__actor-name">{row.actorId?.name || 'Unknown user'}</span>
            <StatusBadge
              status={row.actorId?.role || row.actorRole || 'unknown'}
              variant="neutral"
              label={row.actorId?.role || row.actorRole || 'unknown'}
            />
          </div>
        ),
      },
      {
        key: 'action',
        label: 'Action',
        width: '24%',
        render: (value) => <span className="audit-log-table__action">{value || '-'}</span>,
      },
      {
        key: 'targetModel',
        label: 'Target Model',
        width: '14%',
        render: (value) => value || '-',
      },
      {
        key: 'targetId',
        label: 'Target ID',
        width: '24%',
        render: (value) => (
          <span className="audit-log-table__target-id" title={value || ''}>
            {truncateTargetId(value)}
          </span>
        ),
      },
    ];
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    onApplyFilters();
  };

  return (
    <section className="audit-log-table">
      <form className="audit-log-table__filters" onSubmit={handleSubmit}>
        <input
          type="text"
          className="audit-log-table__input"
          placeholder="Actor ID"
          value={filters.actorId}
          onChange={(event) => onFilterChange('actorId', event.target.value)}
        />

        <input
          type="text"
          className="audit-log-table__input"
          placeholder="Action keyword"
          value={filters.action}
          onChange={(event) => onFilterChange('action', event.target.value)}
        />

        <select
          className="audit-log-table__input"
          value={filters.targetModel}
          onChange={(event) => onFilterChange('targetModel', event.target.value)}
        >
          <option value="">All Target Models</option>
          {TARGET_MODEL_OPTIONS.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        <div className="audit-log-table__date-range">
          <input
            type="date"
            className="audit-log-table__input"
            value={filters.startDate}
            onChange={(event) => onFilterChange('startDate', event.target.value)}
          />
          <input
            type="date"
            className="audit-log-table__input"
            value={filters.endDate}
            onChange={(event) => onFilterChange('endDate', event.target.value)}
          />
        </div>

        <div className="audit-log-table__actions">
          <button type="submit" className="audit-log-table__btn audit-log-table__btn--primary">
            Apply Filters
          </button>
          <button
            type="button"
            className="audit-log-table__btn audit-log-table__btn--ghost"
            onClick={onClearFilters}
          >
            Clear
          </button>
        </div>
      </form>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyText="No audit entries found"
      />
    </section>
  );
};

export default AuditLogTable;
