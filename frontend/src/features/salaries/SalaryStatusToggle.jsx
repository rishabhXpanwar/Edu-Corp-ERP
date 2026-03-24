import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { markSalaryPaid, markSalaryUnpaid, markSalaryDelayed } from './salarySlice';
import './SalaryStatusToggle.css';

const SalaryStatusToggle = ({ salary }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const status = salary?.status || 'unpaid';

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!salary?._id || loading || newStatus === status) {
      return;
    }

    setLoading(true);
    try {
      if (newStatus === 'paid') {
        await dispatch(markSalaryPaid(salary._id)).unwrap();
      } else if (newStatus === 'unpaid') {
        await dispatch(markSalaryUnpaid(salary._id)).unwrap();
      } else if (newStatus === 'delayed') {
        await dispatch(markSalaryDelayed(salary._id)).unwrap();
      }
    } catch (error) {
      console.log('[SalaryStatusToggle] status update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      className={`salary-status-select salary-status--${status}`}
      value={status}
      onChange={handleStatusChange}
      disabled={loading}
    >
      <option value="unpaid">Unpaid</option>
      <option value="paid">Paid</option>
      <option value="delayed">Delayed</option>
    </select>
  );
};

export default SalaryStatusToggle;
