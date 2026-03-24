import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { fetchMyLeaveHistory } from './leaveSlice';

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }
  return new Date(value).toLocaleDateString();
};

const LeaveHistoryTable = () => {
  const dispatch = useDispatch();
  const { myRequests, loading, pagination } = useSelector((state) => state.leave);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchMyLeaveHistory({ page: currentPage, limit: 20 }));
  }, [dispatch, currentPage]);

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (value) => value || 'N/A',
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value) => value || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value || 'pending'} />,
    },
    {
      key: 'reviewNote',
      label: 'Review Note',
      render: (value) => value || '-',
    },
  ];

  return (
    <div className="leave-table-wrap">
      <DataTable
        columns={columns}
        data={myRequests}
        loading={loading}
        emptyText="No leave requests found."
      />

      {pagination.totalPages > 1 && (
        <div className="leave-table-wrap__pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            perPage={pagination.limit}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default LeaveHistoryTable;
