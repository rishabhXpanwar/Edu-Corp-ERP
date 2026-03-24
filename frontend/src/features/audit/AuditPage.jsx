import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import Spinner from '../../components/Spinner.jsx';
import AuditLogTable from './AuditLogTable.jsx';
import {
  fetchAuditLogs,
  selectAuditError,
  selectAuditLoading,
  selectAuditLogs,
  selectAuditPagination,
} from './auditSlice.js';
import './AuditPage.css';

const defaultFilters = {
  actorId: '',
  action: '',
  targetModel: '',
  startDate: '',
  endDate: '',
};

const buildQueryFromFilters = (filters) => {
  const query = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim() === '') {
      return;
    }
    if (value === undefined || value === null) {
      return;
    }
    query[key] = typeof value === 'string' ? value.trim() : value;
  });

  return query;
};

const AuditPage = () => {
  const dispatch = useDispatch();
  const logs = useSelector(selectAuditLogs);
  const loading = useSelector(selectAuditLoading);
  const error = useSelector(selectAuditError);
  const pagination = useSelector(selectAuditPagination);

  const [filters, setFilters] = useState({ ...defaultFilters });
  const [currentPage, setCurrentPage] = useState(1);

  const activeQueryFilters = useMemo(() => buildQueryFromFilters(filters), [filters]);

  useEffect(() => {
    console.log('[AuditPage] initial fetch');
    dispatch(fetchAuditLogs({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    dispatch(
      fetchAuditLogs({
        page: 1,
        limit: 20,
        ...activeQueryFilters,
      }),
    );
  };

  const handleClearFilters = () => {
    setFilters({ ...defaultFilters });
    setCurrentPage(1);
    dispatch(fetchAuditLogs({ page: 1, limit: 20 }));
  };

  const handlePageChange = (nextPage) => {
    setCurrentPage(nextPage);
    dispatch(
      fetchAuditLogs({
        page: nextPage,
        limit: 20,
        ...activeQueryFilters,
      }),
    );
  };

  if (loading && logs.length === 0) {
    return (
      <div className="audit-page school-panel">
        <PageHeader title="Audit Log" subtitle="Read-only school activity timeline" />
        <div className="audit-page__loading">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="audit-page school-panel">
      <PageHeader
        title="Audit Log"
        subtitle="Read-only school activity timeline"
      />

      <section className="audit-page__card">
        {error && <p className="audit-page__error">{error}</p>}

        <AuditLogTable
          logs={logs}
          loading={loading}
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            perPage={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </div>
  );
};

export default AuditPage;
