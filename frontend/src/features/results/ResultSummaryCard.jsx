import React from 'react';

const ResultSummaryCard = ({ results }) => {
  if (!results || Object.keys(results).length === 0) return null;

  const total = results.totalObtained || 0;
  const max = results.maxTotal || 0;
  const rank = results.rank || '-';
  const percentage = results.percentage 
    ? parseFloat(results.percentage).toFixed(2) + '%' 
    : '-';
  const status = results.status === 'published' ? 'Published' : 'Draft';

  return (
    <div className="result-summary-card">
      <div className="summary-item">
        <span className="summary-label">Total Marks</span>
        <span className="summary-value">{total} / {max}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Percentage</span>
        <span className="summary-value percentage-highlight">{percentage}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Rank / Division</span>
        <span className="summary-value">{rank}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Status</span>
        <span className={`summary-value status-badge badge-${status.toLowerCase()}`}>{status}</span>
      </div>
    </div>
  );
};

export default ResultSummaryCard;
