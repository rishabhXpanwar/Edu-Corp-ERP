import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { applyIncrement } from './salarySlice';
import Modal from '../../components/Modal';

const ApplyIncrementModal = ({ isOpen, onClose, currentMonth, currentYear, currentPage, limit = 20 }) => {
  const dispatch = useDispatch();
  const [percent, setPercent] = useState('5');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const p = parseFloat(percent);
    if (!p || p <= 0 || p > 100) return;

    setLoading(true);
    try {
      await dispatch(
        applyIncrement({
          incrementPercent: p,
          month: currentMonth,
          year: currentYear,
          page: currentPage,
          limit,
        })
      ).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to apply increment:', error);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', width: '100%' }}>
      <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
        Cancel
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading || !percent}
      >
        {loading ? 'Applying...' : 'Apply Increment'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply Annual Increment`} footer={footer}>
      <p style={{ marginBottom: '1rem', color: 'var(--text-color-muted)' }}>
        This will calculate a new salary base for all teachers/managers based on their previous highest salary record.
        It will create unpaid salary entries for <strong>{currentMonth}/{currentYear}</strong>.
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Increment Percentage (%)
          </label>
          <input
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="input-field"
            required
            autoFocus
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ApplyIncrementModal;
