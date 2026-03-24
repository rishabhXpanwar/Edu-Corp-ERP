import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTeachers, updateUserStatus } from './teacherSlice.js';
import Pagination from '../../components/Pagination.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import AddTeacherModal from './AddTeacherModal.jsx';
import './TeachersPage.css';

const TeachersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { teachers, loading, error, pagination } = useSelector(state => state.teachers);
  
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ isOpen: false, teacher: null });

  useEffect(() => {
    dispatch(fetchTeachers({ page: pagination.page, limit: pagination.limit, search }));
  }, [dispatch, pagination.page, pagination.limit, search]);

  const handlePageChange = (newPage) => {
    dispatch(fetchTeachers({ page: newPage, limit: pagination.limit, search }));
  };

  const handleSearchChange = (e) => setSearch(e.target.value);

  const handleRowClick = (teacher) => {
    navigate(`/teachers/${teacher._id}`);
  };

  const toggleStatus = () => {
    if (!statusDialog.teacher) return;
    const { _id, isActive } = statusDialog.teacher;
    dispatch(updateUserStatus({ id: _id, isActive: !isActive }));
    setStatusDialog({ isOpen: false, teacher: null });
  };

  if (error) return <EmptyState title="Error" description={error.message} />;

  return (
    <div className="teachers-page">
      <div className="teachers-page__header">
        <h1>Teachers</h1>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>Add Teacher</button>
      </div>

      <div className="filters-panel">
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="teachers-page__content">
        {loading && teachers.length === 0 ? (
          <Spinner />
        ) : (
          <div className="table-responsive">
             <table className="data-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(teacher => (
                    <tr key={teacher._id} onClick={() => handleRowClick(teacher)} className="clickable-row">
                      <td>
                        <img 
                          src={teacher.avatarUrl || `https://ui-avatars.com/api/?name=${teacher.name}&background=random`} 
                          alt="avatar" 
                          className="user-avatar" 
                        />
                      </td>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      <td>{teacher.phone}</td>
                      <td>{teacher.designation || 'N/A'}</td>
                      <td>
                        <span className={`badge ${teacher.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-outline btn-small"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setStatusDialog({ isOpen: true, teacher }); 
                          }}
                        >
                          {teacher.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
             {teachers.length === 0 && !loading && (
                <EmptyState title="No Teachers Found" description="Try adjusting your search criteria." />
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

      {isAddModalOpen && (
        <AddTeacherModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      <ConfirmDialog
        isOpen={statusDialog.isOpen}
        title={statusDialog.teacher?.isActive ? "Deactivate Teacher" : "Activate Teacher"}
        message={`Are you sure you want to ${statusDialog.teacher?.isActive ? 'deactivate' : 'activate'} this teacher?`}
        confirmText="Confirm"
        onConfirm={toggleStatus}
        onCancel={() => setStatusDialog({ isOpen: false, teacher: null })}
        isDanger={statusDialog.teacher?.isActive}
      />
    </div>
  );
};

export default TeachersPage;
