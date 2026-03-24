import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchManagers, updateManagerStatus } from './managerSlice.js';
import Pagination from '../../components/Pagination.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import AddManagerModal from './AddManagerModal.jsx';
import '../teachers/TeachersPage.css'; // Reusing layout CSS

const getRoleBadgeColor = (role) => {
    switch(role) {
        case 'financeManager': return '#10b981'; // green
        case 'hrManager': return '#8b5cf6'; // purple
        case 'academicManager': return '#f59e0b'; // orange
        case 'adminManager': return '#ef4444'; // red
        default: return '#6b7280'; // gray
    }
};

const formatRoleName = (role) => {
    switch(role) {
        case 'financeManager': return 'Finance Manager';
        case 'hrManager': return 'HR Manager';
        case 'academicManager': return 'Academic Manager';
        case 'adminManager': return 'Admin Manager';
        default: return role;
    }
};

const ManagersPage = () => {
  const dispatch = useDispatch();
  const { managers, loading, error, pagination } = useSelector(state => state.managers);
  
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ isOpen: false, manager: null });

  useEffect(() => {
    dispatch(fetchManagers({ page: pagination.page, limit: pagination.limit, search }));
  }, [dispatch, pagination.page, pagination.limit, search]);

  const handlePageChange = (newPage) => {
    dispatch(fetchManagers({ page: newPage, limit: pagination.limit, search }));
  };

  const handleSearchChange = (e) => setSearch(e.target.value);

  const toggleStatus = () => {
    if (!statusDialog.manager) return;
    const { _id, isActive } = statusDialog.manager;
    dispatch(updateManagerStatus({ id: _id, isActive: !isActive }));
    setStatusDialog({ isOpen: false, manager: null });
  };

  if (error) return <EmptyState title="Error" description={error.message} />;

  return (
    <div className="teachers-page">
      <div className="teachers-page__header">
        <h1>Operations Managers</h1>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>Add Manager</button>
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
        {loading && managers.length === 0 ? (
          <Spinner />
        ) : (
          <div className="table-responsive">
             <table className="data-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map(manager => (
                    <tr key={manager._id}>
                      <td>
                        <img 
                          src={manager.avatarUrl || `https://ui-avatars.com/api/?name=${manager.name}&background=random`} 
                          alt="avatar" 
                          className="user-avatar" 
                        />
                      </td>
                      <td>{manager.name}</td>
                      <td>
                        <span 
                           className="badge" 
                           style={{ backgroundColor: getRoleBadgeColor(manager.role), color: 'white' }}
                        >
                            {formatRoleName(manager.role)}
                        </span>
                      </td>
                      <td>{manager.email}</td>
                      <td>{manager.phone}</td>
                      <td>
                        <span className={`badge ${manager.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {manager.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-outline btn-small"
                          onClick={() => setStatusDialog({ isOpen: true, manager })}
                        >
                          {manager.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
             {managers.length === 0 && !loading && (
                <EmptyState title="No Managers Found" description="Try adjusting your search criteria." />
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
        <AddManagerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      <ConfirmDialog
        isOpen={statusDialog.isOpen}
        title={statusDialog.manager?.isActive ? "Deactivate Manager" : "Activate Manager"}
        message={`Are you sure you want to ${statusDialog.manager?.isActive ? 'deactivate' : 'activate'} this manager?`}
        confirmText="Confirm"
        onConfirm={toggleStatus}
        onCancel={() => setStatusDialog({ isOpen: false, manager: null })}
        isDanger={statusDialog.manager?.isActive}
      />
    </div>
  );
};

export default ManagersPage;
