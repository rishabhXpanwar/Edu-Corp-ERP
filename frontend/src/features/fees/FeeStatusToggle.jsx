import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { markFeePaid, markFeeUnpaid } from './feeSlice';

const FeeStatusToggle = ({ fee }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const isPaid = fee.status === 'paid';

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isPaid) {
        await dispatch(markFeeUnpaid(fee._id)).unwrap();
      } else {
        await dispatch(markFeePaid(fee._id)).unwrap();
      }
    } catch (error) {
      console.error('Failed to toggle fee status', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`fee-status-toggle ${isPaid ? 'paid' : 'unpaid'} ${loading ? 'loading' : ''}`}
      style={{
        padding: '0.25rem 0.5rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--surface-color)',
        color: 'var(--text-color)',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s ease',
      }}
      title={`Mark as ${isPaid ? 'unpaid' : 'paid'}`}
    >
      <div 
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: isPaid ? 'var(--success-color)' : 'var(--danger-color)',
        }}
      />
      {loading ? 'Wait...' : (isPaid ? 'Mark Unpaid' : 'Mark Paid')}
    </button>
  );
};

export default FeeStatusToggle;
