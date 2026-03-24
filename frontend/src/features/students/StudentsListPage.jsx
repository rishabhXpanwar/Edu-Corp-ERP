import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchStudents } from './studentSlice.js';
import DataTable from '../../components/DataTable.jsx';
import Pagination from '../../components/Pagination.jsx';
import StudentFilters from './StudentFilters.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import './StudentsListPage.css';

const StudentsListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students, loading, error, pagination } = useSelector(state => state.students);
  
  const [filters, setFilters] = useState({ classId: '', sectionId: '', search: '' });

  useEffect(() => {
    dispatch(fetchStudents({ ...filters, page: pagination.page, limit: pagination.limit }));
  }, [dispatch, filters, pagination.page, pagination.limit]);

  const handlePageChange = (newPage) => {
    dispatch(fetchStudents({ ...filters, page: newPage, limit: pagination.limit }));
  };

  const handleRowClick = (student) => {
    navigate(`/students/${student._id}`);
  };

  const columns = [
    { 
      key: 'avatar', 
      label: 'Avatar', 
      render: (stu) => (
        <img 
          src={stu.avatarUrl || `https://ui-avatars.com/api/?name=${stu.name}&background=random`} 
          alt="avatar" 
          className="student-avatar" 
        />
      )
    },
    { key: 'name', label: 'Name' },
    { key: 'admissionNumber', label: 'Admission No.' },
    { 
      key: 'classSection', 
      label: 'Class & Section', 
      render: (stu) => `${stu.classId?.name || 'N/A'} - ${stu.sectionId?.name || 'N/A'}`
    },
    { key: 'phone', label: 'Phone' },
    { 
        key: 'actions', 
        label: 'Actions', 
        render: (stu) => (
          <button className="btn btn-outline btn-small" onClick={(e) => { e.stopPropagation(); handleRowClick(stu); }}>
            View
          </button>
        )
      }
  ];

  if (error) return <EmptyState title="Error" description={error.message} />;

  return (
    <div className="students-page">
      <div className="students-page__header">
        <h1>Students Directory</h1>
        <Link to="/students/new" className="btn btn-primary">Admit Student</Link>
      </div>

      <StudentFilters filters={filters} setFilters={setFilters} />

      <div className="students-page__content">
        {loading && students.length === 0 ? (
          <Spinner />
        ) : (
          <div className="table-responsive">
             <table className="data-table">
                <thead>
                  <tr>
                    {columns.map(col => <th key={col.key}>{col.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {students.map(stu => (
                    <tr key={stu._id} onClick={() => handleRowClick(stu)} className="clickable-row">
                       {columns.map(col => (
                         <td key={col.key}>{col.render ? col.render(stu) : stu[col.key]}</td>
                       ))}
                    </tr>
                  ))}
                </tbody>
             </table>
             {students.length === 0 && !loading && (
                <EmptyState title="No Students Found" description="Try adjusting your filters." />
             )}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <Pagination 
          currentPage={pagination.page} 
          totalPages={pagination.totalPages} 
          onPageChange={handlePageChange} 
        />
      )}
    </div>
  );
};

export default StudentsListPage;
