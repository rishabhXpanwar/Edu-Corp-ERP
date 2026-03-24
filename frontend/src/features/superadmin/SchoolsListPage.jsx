import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { fetchSchools, createNewSchool } from './saSchoolsSlice.js';

import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/DataTable.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import Spinner from '../../components/Spinner.jsx';

import './SchoolsListPage.css';

const schoolSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  email: z.string().email('Valid email is required'),
  principalName: z.string().min(2, 'Principal Name is required'),
  principalEmail: z.string().email('Valid principal email is required'),
  principalPhone: z.string().min(10, 'Valid principal phone is required'),
  planId: z.string().optional() // Ideally references actual plans, keeping optional for now
});

const SchoolsListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pagination, loading, actionLoading } = useSelector(state => state.saSchools);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schoolSchema)
  });

  useEffect(() => {
    dispatch(fetchSchools({ page, limit: 10 }));
  }, [dispatch, page]);

  const onSubmit = async (data) => {
    // Need to generate default password or rely on backend to send email.
    // The backend endpoint for creating a school expects this. 
    // Comp-03-BE handled the transaction.
    const resultAction = await dispatch(createNewSchool(data));
    if (createNewSchool.fulfilled.match(resultAction)) {
      setIsModalOpen(false);
      reset();
      dispatch(fetchSchools({ page, limit: 10 })); // refresh list
    }
  };

  const columns = [
    { key: 'name', label: 'School Name' },
    { key: 'email', label: 'Email' },
    { key: 'plan', label: 'Plan', render: (val, row) => row.subscription?.planId?.name || 'Standard' },
    {
      key: 'status',
      label: 'Status',
      render: (status, row) => (
        <StatusBadge status={status || (row.isActive ? 'active' : 'suspended')} />
      ),
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (_, row) => (
        <button 
          className="btn-link"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/superadmin/schools/${row._id}`);
          }}
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div className="schools-list-page">
      <PageHeader 
        title="Schools" 
        subtitle="Manage all tenant schools registered in EduCore."
        action={
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + Add New School
          </button>
        }
      />

      <div className="schools-table-container">
        <DataTable 
          columns={columns} 
          data={items} 
          loading={loading && items.length === 0} 
          onRowClick={(row) => navigate(`/superadmin/schools/${row._id}`)}
          emptyText="No schools found."
        />
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination-wrapper">
            <Pagination 
              currentPage={page} 
              totalPages={pagination.totalPages} 
              onPageChange={(p) => setPage(p)} 
            />
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); reset(); }} 
        title="Register New School"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="school-form">
          <div className="form-section">
            <h4>School Details</h4>
            <div className="form-group">
              <label>School Name *</label>
              <input {...register('name')} className={errors.name ? 'input-error' : ''} />
              {errors.name && <span className="error-text">{errors.name.message}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" {...register('email')} className={errors.email ? 'input-error' : ''} />
                {errors.email && <span className="error-text">{errors.email.message}</span>}
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input {...register('phone')} className={errors.phone ? 'input-error' : ''} />
                {errors.phone && <span className="error-text">{errors.phone.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Address *</label>
              <input {...register('address')} className={errors.address ? 'input-error' : ''} />
              {errors.address && <span className="error-text">{errors.address.message}</span>}
            </div>
          </div>

          <div className="form-section">
            <h4>Principal Details (Admin Account)</h4>
            <div className="form-group">
              <label>Principal Name *</label>
              <input {...register('principalName')} className={errors.principalName ? 'input-error' : ''} />
              {errors.principalName && <span className="error-text">{errors.principalName.message}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Principal Email *</label>
                <input type="email" {...register('principalEmail')} className={errors.principalEmail ? 'input-error' : ''} />
                {errors.principalEmail && <span className="error-text">{errors.principalEmail.message}</span>}
              </div>
              <div className="form-group">
                <label>Principal Phone *</label>
                <input {...register('principalPhone')} className={errors.principalPhone ? 'input-error' : ''} />
                {errors.principalPhone && <span className="error-text">{errors.principalPhone.message}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? <Spinner size="small" color="#fff" /> : 'Register School'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SchoolsListPage;
