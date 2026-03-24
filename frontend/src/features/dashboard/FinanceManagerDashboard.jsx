import React, { useEffect, useMemo, useRef } from 'react';
import { BadgeIndianRupee, CircleDollarSign, Clock3, Wallet } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFees } from '../fees/feeSlice.js';
import { fetchSalaries } from '../salaries/salarySlice.js';
import StatsCard from '../../components/StatsCard.jsx';
import './FinanceManagerDashboard.css';

const formatDate = (value) => {
  if (!value) {
    return 'Date not set';
  }
  return new Date(value).toLocaleDateString();
};

const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getStudentName = (student) => {
  if (!student) {
    return 'Student';
  }
  if (student.name) {
    return student.name;
  }
  const first = student.firstName || '';
  const last = student.lastName || '';
  const fullName = `${first} ${last}`.trim();
  return fullName || 'Student';
};

const FinanceManagerDashboard = ({ chartColors }) => {
  const dispatch = useDispatch();
  const requestFlags = useRef({ fees: false, salaries: false });

  const { items: feeItems, stats: feeStats, loading: feeLoading } = useSelector((state) => state.fee);
  const { items: salaryItems, loading: salaryLoading } = useSelector((state) => state.salary);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    console.log('[FinanceManagerDashboard] evaluating data dependencies');

    if (!feeItems.length && !feeLoading && !requestFlags.current.fees) {
      requestFlags.current.fees = true;
      dispatch(fetchFees({ page: 1, limit: 100 }));
    }

    if (!salaryItems.length && !salaryLoading && !requestFlags.current.salaries) {
      requestFlags.current.salaries = true;
      dispatch(fetchSalaries({ page: 1, limit: 100, month, year }));
    }
  }, [dispatch, feeItems.length, feeLoading, month, salaryItems.length, salaryLoading, year]);

  const collectedAmount = useMemo(() => {
    if (typeof feeStats?.collected === 'number') {
      return feeStats.collected;
    }
    return feeItems
      .filter((item) => item.status === 'paid')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [feeItems, feeStats?.collected]);

  const outstandingAmount = useMemo(() => {
    if (typeof feeStats?.outstanding === 'number') {
      return feeStats.outstanding;
    }
    return feeItems
      .filter((item) => item.status !== 'paid')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [feeItems, feeStats?.outstanding]);

  const salariesPaidAmount = useMemo(() => {
    return salaryItems
      .filter((item) => item.status === 'paid')
      .reduce((sum, item) => sum + Number(item.totalAmount || item.baseSalary || 0), 0);
  }, [salaryItems]);

  const pendingSalariesCount = useMemo(() => {
    return salaryItems.filter((item) => item.status !== 'paid').length;
  }, [salaryItems]);

  const feesByWeekData = useMemo(() => {
    const buckets = [
      { week: 'Week 1', amount: 0 },
      { week: 'Week 2', amount: 0 },
      { week: 'Week 3', amount: 0 },
      { week: 'Week 4', amount: 0 },
    ];

    feeItems.forEach((fee) => {
      if (fee.status !== 'paid') {
        return;
      }

      const dateValue = fee.paidDate || fee.updatedAt || fee.createdAt || fee.dueDate;
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      if (date.getMonth() + 1 !== month || date.getFullYear() !== year) {
        return;
      }

      const weekIndex = Math.min(3, Math.floor((date.getDate() - 1) / 7));
      buckets[weekIndex].amount += Number(fee.amount || 0);
    });

    return buckets;
  }, [feeItems, month, year]);

  const salaryStatusData = useMemo(() => {
    const paidCount = salaryItems.filter((item) => item.status === 'paid').length;
    const unpaidCount = salaryItems.filter((item) => item.status !== 'paid').length;

    return [
      { label: 'Paid', count: paidCount },
      { label: 'Unpaid', count: unpaidCount },
    ];
  }, [salaryItems]);

  const overdueFees = useMemo(() => {
    const nowTs = Date.now();
    return feeItems
      .filter((fee) => {
        if (fee.status === 'overdue') {
          return true;
        }
        return fee.status !== 'paid' && toTimestamp(fee.dueDate) > 0 && toTimestamp(fee.dueDate) < nowTs;
      })
      .sort((left, right) => toTimestamp(left.dueDate) - toTimestamp(right.dueDate))
      .slice(0, 5);
  }, [feeItems]);

  const recentlyPaidSalaries = useMemo(() => {
    return salaryItems
      .filter((salary) => salary.status === 'paid')
      .sort((left, right) => {
        const rightDate = toTimestamp(right.paidDate || right.updatedAt || right.createdAt);
        const leftDate = toTimestamp(left.paidDate || left.updatedAt || left.createdAt);
        return rightDate - leftDate;
      })
      .slice(0, 5);
  }, [salaryItems]);

  return (
    <div className="dashboard-role finance-manager-dashboard">
      <header className="dashboard-role__header">
        <h1 className="dashboard-role__title">Finance Manager Dashboard</h1>
        <p className="dashboard-role__subtitle">Financial health indicators for fees and salary disbursements</p>
      </header>

      <section className="dashboard-role__stats">
        <StatsCard
          title="Fees Collected"
          value={formatCurrency(collectedAmount)}
          icon={<CircleDollarSign size={20} />}
          accentColor={chartColors.success}
        />
        <StatsCard
          title="Outstanding Fees"
          value={formatCurrency(outstandingAmount)}
          icon={<Wallet size={20} />}
          accentColor={chartColors.warning}
        />
        <StatsCard
          title="Salaries Paid"
          value={formatCurrency(salariesPaidAmount)}
          icon={<BadgeIndianRupee size={20} />}
          accentColor={chartColors.primary}
        />
        <StatsCard
          title="Pending Salaries"
          value={pendingSalariesCount}
          icon={<Clock3 size={20} />}
          accentColor={chartColors.danger}
        />
      </section>

      <section className="dashboard-role__charts">
        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Weekly Fee Collection</h2>
              <p className="dashboard-card__subtitle">Paid fees grouped by week for current month</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {feeItems.length === 0 ? (
              <p className="dashboard-widget-list__empty">No fee records available yet.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={feesByWeekData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <h2 className="dashboard-card__title">Salary Status</h2>
              <p className="dashboard-card__subtitle">Paid vs unpaid salary records</p>
            </div>
          </div>
          <div className="dashboard-card__content">
            {salaryItems.length === 0 ? (
              <p className="dashboard-widget-list__empty">No salary records available yet.</p>
            ) : (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salaryStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {salaryStatusData.map((entry) => (
                        <Cell
                          key={entry.label}
                          fill={entry.label === 'Paid' ? chartColors.success : chartColors.danger}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-role__widgets">
        <article className="dashboard-card dashboard-card--widget">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Top Overdue Fees</h2>
          </div>
          <ul className="dashboard-widget-list">
            {overdueFees.length ? (
              overdueFees.map((fee) => (
                <li key={fee._id} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{fee.title || 'Fee entry'}</span>
                    <span className="dashboard-widget-list__meta">
                      {getStudentName(fee.studentId)} - Due {formatDate(fee.dueDate)}
                    </span>
                  </div>
                  <span className="dashboard-widget-list__value">{formatCurrency(fee.amount)}</span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No overdue fees found.</li>
            )}
          </ul>
        </article>

        <article className="dashboard-card dashboard-card--widget">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Recently Paid Salaries</h2>
          </div>
          <ul className="dashboard-widget-list">
            {recentlyPaidSalaries.length ? (
              recentlyPaidSalaries.map((salary) => (
                <li key={salary._id} className="dashboard-widget-list__item">
                  <div>
                    <span className="dashboard-widget-list__title">{salary.teacherId?.name || 'Staff member'}</span>
                    <span className="dashboard-widget-list__meta">Paid {formatDate(salary.paidDate)}</span>
                  </div>
                  <span className="dashboard-widget-list__value">
                    {formatCurrency(salary.totalAmount || salary.baseSalary)}
                  </span>
                </li>
              ))
            ) : (
              <li className="dashboard-widget-list__empty">No paid salary entries yet.</li>
            )}
          </ul>
        </article>
      </section>
    </div>
  );
};

export default FinanceManagerDashboard;
