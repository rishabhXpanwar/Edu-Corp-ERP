import React from 'react';
import { Link } from 'react-router-dom';
import './AcademicYearForm.css';

const formatMonthYear = (value) => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

const AcademicYearForm = ({ currentYear }) => {
  return (
    <section className="settings-card" aria-label="Academic year settings">
      <h2 className="card-section-title">Academic Year</h2>

      <p className="academic-year-label">Current Academic Year</p>

      {currentYear ? (
        <>
          <p className="academic-year-name">{currentYear.name}</p>
          <p className="academic-year-range">
            {formatMonthYear(currentYear.startDate)} - {formatMonthYear(currentYear.endDate)}
          </p>
        </>
      ) : (
        <p className="no-year-text">No current academic year is set.</p>
      )}

      <Link className="settings-manage-link" to="/classes">
        Manage Academic Years -&gt;
      </Link>
    </section>
  );
};

export default AcademicYearForm;
