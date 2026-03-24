import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentFees, clearStudentFees } from './feeSlice';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import FeeStatusToggle from './FeeStatusToggle';
import Spinner from '../../components/Spinner';

const StudentFeeHistory = ({ studentId }) => {
  const dispatch = useDispatch();
  const { studentFees, loading, error } = useSelector((state) => state.fee);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (studentId) {
      dispatch(fetchStudentFees(studentId));
    }
    return () => {
      dispatch(clearStudentFees());
    };
  }, [dispatch, studentId]);

  if (loading && studentFees.length === 0) {
    return <Spinner />;
  }

  if (error) {
    return <div className="error-text">Error loading fees: {error}</div>;
  }

  if (!studentFees || studentFees.length === 0) {
    return <div className="empty-state">No fee records found for this student.</div>;
  }

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'amount',
      label: 'Amount (₹)',
      render: (item) => <strong>₹{item.amount.toLocaleString('en-IN')}</strong>,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (item) => new Date(item.dueDate).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => {
        let tag = 'amber'; // assumes overdue or pending
        if (item.status === 'paid') tag = 'green';
        else if (item.status === 'unpaid') tag = 'red';
        return <StatusBadge status={item.status} type={tag} />;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => {
        const canManage = ['principal', 'financeManager'].includes(user.role);
        return canManage ? <FeeStatusToggle fee={item} /> : null;
      },
    },
  ];

  const totalPaid = studentFees
    .filter((f) => f.status === 'paid')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalOutstanding = studentFees
    .filter((f) => f.status !== 'paid')
    .reduce((acc, f) => acc + f.amount, 0);

  return (
    <div className="student-fee-history">
      <div className="fee-summary-mini" style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div className="stat">
          <span style={{ fontSize: '0.875rem', color: 'var(--success-color)' }}>Total Paid</span>
          <h4 style={{ margin: 0, marginTop: '0.25rem' }}>₹{totalPaid.toLocaleString('en-IN')}</h4>
        </div>
        <div className="stat">
          <span style={{ fontSize: '0.875rem', color: 'var(--danger-color)' }}>Outstanding</span>
          <h4 style={{ margin: 0, marginTop: '0.25rem' }}>₹{totalOutstanding.toLocaleString('en-IN')}</h4>
        </div>
      </div>
      <DataTable columns={columns} data={studentFees} keyExtractor={(fee) => fee._id} />
    </div>
  );
};

export default StudentFeeHistory;
