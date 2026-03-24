import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFees, markFeePaid } from './feeSlice';
import { fetchClasses } from '../classes/classSlice';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import FeeStatusToggle from './FeeStatusToggle';
import FeeModal from './FeeModal';
import useDebounce from '../../hooks/useDebounce';
import { FiPlus, FiDollarSign, FiSearch } from 'react-icons/fi';
import './FeesPage.css';

const FeesPage = () => {
  const dispatch = useDispatch();
  const { items, stats, loading, pagination } = useSelector((state) => state.fee);
  
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'paid', 'unpaid'
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const { classes: classList } = useSelector((state) => state.classes);

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchFees({ 
      page, 
      status: filterMode === 'all' ? undefined : filterMode,
      studentName: debouncedSearch || undefined,
      classId: selectedClassId || undefined,
      sectionId: selectedSectionId || undefined,
    }));
  }, [dispatch, page, filterMode, debouncedSearch, selectedClassId, selectedSectionId]);

  const handleTabChange = (mode) => {
    setFilterMode(mode);
    setPage(1);
  };

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setSelectedSectionId(''); // reset section on class change
    setPage(1);
  };

  const handleSectionChange = (e) => {
    setSelectedSectionId(e.target.value);
    setPage(1);
  };

  const selectedClassObject = classList?.find(c => c._id === selectedClassId);

  const handleMarkAllVisiblePaid = async () => {
    const unpaidFees = items.filter(f => f.status === 'unpaid');
    if (!unpaidFees.length) {
      toast.info('No unpaid fees visible on this page.');
      return;
    }

    if (!window.confirm(`Are you sure you want to mark ${unpaidFees.length} visible fees as paid?`)) {
      return;
    }

    // Process sequentially to avoid abusing rate limit if there are many items
    for (const fee of unpaidFees) {
      await dispatch(markFeePaid(fee._id));
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'student',
      label: 'Student',
      render: (_, item) => (
        <div className="student-info">
          {item.studentId ? (
            <>
              <span className="student-name">
                {item.studentId.firstName} {item.studentId.lastName}
              </span>
              <span className="student-admission">
                {item.studentId.admissionNumber}
              </span>
            </>
          ) : (
            <span className="text-muted">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: 'class',
      label: 'Class',
      render: (_, item) => item.classId?.name || 'All',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => <strong>₹{Number(value || 0).toLocaleString('en-IN')}</strong>,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        let tag = 'amber';
        if (value === 'paid') tag = 'green';
        else if (value === 'unpaid') tag = 'red';
        return <StatusBadge status={value} type={tag} />;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, item) => <FeeStatusToggle fee={item} />,
    },
  ];

  return (
    <div className="fees-page fade-in">
      <PageHeader
        title="Fees Management"
        actionButton={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <FiPlus /> Add Fee
            </button>
            <button className="btn btn-secondary" onClick={handleMarkAllVisiblePaid}>
              Mark Page Paid
            </button>
          </div>
        }
      />

      <div className="fees-stats-container">
        <StatsCard
          title="Total Collected"
          value={`₹${(stats?.collected || 0).toLocaleString('en-IN')}`}
          icon={<FiDollarSign />}
          trend={+5.2}
          color="success"
        />
        <StatsCard
          title="Total Outstanding"
          value={`₹${(stats?.outstanding || 0).toLocaleString('en-IN')}`}
          icon={<FiDollarSign />}
          color="danger"
        />
      </div>

      <div className="fees-controls">
        <div className="fees-filter-tabs">
          {['all', 'paid', 'unpaid'].map((tab) => (
            <button
              key={tab}
              className={`fee-tab ${filterMode === tab ? 'active' : ''}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="fees-search">
          <select 
            className="fees-search-select" 
            value={selectedClassId} 
            onChange={handleClassChange}
          >
            <option value="">All Classes</option>
            {classList?.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select 
            className="fees-search-select" 
            value={selectedSectionId} 
            onChange={handleSectionChange}
            disabled={!selectedClassId || !selectedClassObject?.sections?.length}
          >
            <option value="">All Sections</option>
            {selectedClassObject?.sections?.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <div className="fees-search-bar">
            <FiSearch className="fees-search-icon" />
            <input
              type="text"
              placeholder="Search name or admn no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="fees-search-input"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(item) => item._id}
          loading={loading}
          emptyText="No fees found."
        />
        {pagination?.totalPages > 1 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <FeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default FeesPage;
