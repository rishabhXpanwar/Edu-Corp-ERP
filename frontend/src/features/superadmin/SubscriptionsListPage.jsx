import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchSubscriptions } from './saSubscriptionsSlice.js';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/DataTable.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Spinner from '../../components/Spinner.jsx';
import './SubscriptionsListPage.css';

const SubscriptionsListPage = () => {
  const dispatch = useDispatch();
  const { items, loading, pagination } = useSelector((state) => state.saSubscriptions);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchSubscriptions({ page: currentPage, limit: 10, status: statusFilter }));
  }, [dispatch, currentPage, statusFilter]);

  const columns = [
    {
      key: 'schoolName',
      label: 'School Name',
      render: (_, row) => row.schoolId?.name || 'Unknown School',
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (value) => <span className="plan-badge">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (value) => new Intl.DateTimeFormat('en-US').format(new Date(value)),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Link to={`/superadmin/subscriptions/${row._id}`} className="sa-btn-link">
          View Details
        </Link>
      ),
    },
  ];

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to page 1 on filter
  };

  return (
    <div className="sa-subscriptions-page">
      <PageHeader title="Subscriptions" />
      
      <div className="sa-filters">
        <select 
          value={statusFilter} 
          onChange={handleFilterChange}
          className="sa-filter-select"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="sa-table-container card">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <DataTable columns={columns} data={items} keyField="_id" />
            <Pagination 
              currentPage={pagination.page} 
              totalPages={pagination.totalPages} 
              onPageChange={handlePageChange} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsListPage;
