import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, perPage }) => {
  return (
    <div className="pagination">
      <span className="pagination__info">
        {totalItems && perPage ? (
          `Showing ${(currentPage - 1) * perPage + 1}–${Math.min(currentPage * perPage, totalItems)} of ${totalItems}`
        ) : (
          '...'
        )}
      </span>
      <div className="pagination__controls">
        <button className="pagination__btn" onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}>&laquo; Prev</button>
        <span className="pagination__current">Page {currentPage} of {totalPages}</span>
        <button className="pagination__btn" onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}>Next &raquo;</button>
      </div>
    </div>
  );
};

export default Pagination;
