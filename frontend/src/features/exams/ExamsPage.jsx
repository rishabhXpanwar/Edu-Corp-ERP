import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExams } from './examSlice';
import ExamCard from './ExamCard';
import CreateExamModal from './CreateExamModal';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import './ExamsPage.css';

const ExamsPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.exam);
  const { user } = useSelector((state) => state.auth);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = { limit: 100 };
    if (statusFilter) {
      params.status = statusFilter;
    }
    dispatch(fetchExams(params));
  }, [dispatch, statusFilter]);

  const canCreate = ['superAdmin', 'principal', 'academicManager', 'manager'].includes(user?.role);

  return (
    <div className="exams-page">
      <PageHeader 
        title="Examinations" 
        subtitle="Manage academic exams and date sheets"
      >
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <span className="material-icons">add</span>
            Create Exam
          </button>
        )}
      </PageHeader>

      <div className="filters-bar">
        <select 
          className="form-control filter-select" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Exams</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="exams-content">
        {loading && <Spinner />}
        
        {!loading && error && (
          <div className="error-message">Error loading exams: {error.message || 'Unknown error'}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <EmptyState 
            icon="description"
            title="No Exams Found"
            message="There are no examinations meeting the current criteria."
            action={canCreate ? () => setIsModalOpen(true) : null}
            actionText="Create Exam"
          />
        )}

        {!loading && !error && items.length > 0 && (
          <div className="exams-list">
            {items.map((exam) => (
              <ExamCard key={exam._id} exam={exam} />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateExamModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default ExamsPage;
