import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import SalaryStatusToggle from './SalaryStatusToggle';
import { fetchSalaries } from './salarySlice';
import ApplyIncrementModal from './ApplyIncrementModal';
import './SalariesPage.css';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SalariesPage = () => {
  const dispatch = useDispatch();
  const { items, loading, pagination } = useSelector((state) => state.salary);

  const today = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [isIncrementModalOpen, setIsIncrementModalOpen] = useState(false);

  useEffect(() => {
    dispatch(
      fetchSalaries({
        page: currentPage,
        limit: 20,
        month: selectedMonth,
        year: selectedYear,
      })
    );
  }, [dispatch, currentPage, selectedMonth, selectedYear]);

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear((prev) => prev - 1);
      } else {
        setSelectedMonth((prev) => prev - 1);
      }
    } else if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }

    setCurrentPage(1);
  };

  const columns = [
    {
      key: 'teacher',
      label: 'Teacher',
      render: (_, row) => (
        <div className="salary-teacher-cell">
          <span className="salary-teacher-cell__name">{row.teacherId?.name || 'N/A'}</span>
          <span className="salary-teacher-cell__role">{row.teacherId?.role || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'month',
      label: 'Month',
      render: (value) => MONTH_NAMES[(value || 1) - 1] || 'N/A',
    },
    {
      key: 'year',
      label: 'Year',
    },
    {
      key: 'baseSalary',
      label: 'Base Salary',
      render: (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`,
    },
    {
      key: 'deductions',
      label: 'Deductions',
      render: (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`,
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value || 'unpaid'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => <SalaryStatusToggle salary={row} />,
    },
  ];

  return (
    <div className="salaries-page">
      <PageHeader
        title="Salaries Management"
        subtitle="Track monthly salaries and payment status for teachers and managers"
        actionButton={
          <button
            className="btn btn-primary"
            onClick={() => setIsIncrementModalOpen(true)}
          >
            Apply Increment
          </button>
        }
      />

      <div className="salaries-month-nav">
        <button
          type="button"
          className="salaries-month-nav__arrow"
          onClick={() => handleMonthChange('prev')}
          aria-label="Previous month"
        >
          <FiChevronLeft size={18} />
        </button>

        <div className="salaries-month-nav__label">
          {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
        </div>

        <button
          type="button"
          className="salaries-month-nav__arrow"
          onClick={() => handleMonthChange('next')}
          aria-label="Next month"
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyText="No salaries found for this month."
      />

      {pagination.totalPages > 1 && (
        <div className="salaries-pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            perPage={pagination.limit}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ApplyIncrementModal
        isOpen={isIncrementModalOpen}
        onClose={() => setIsIncrementModalOpen(false)}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        currentPage={currentPage}
        limit={20}
      />
    </div>
  );
};

export default SalariesPage;
