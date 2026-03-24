import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSchoolById, toggleSchoolStatus } from './saSchoolsSlice.js';

import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Spinner from '../../components/Spinner.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { Building2, Mail, Phone, MapPin, UserCheck, Calendar } from 'lucide-react';

import './SchoolDetailPage.css';

const SchoolDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedItem: school, loading, actionLoading, error } = useSelector(state => state.saSchools);

  const [isConfirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchSchoolById(id));
    }
  }, [dispatch, id]);

  if (loading || (!school && !error)) return <div className="page-loader"><Spinner /></div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!school) return <div>School not found.</div>;

  const schoolStatus = school.status || (school.isActive ? 'active' : 'suspended');
  const isSuspended = schoolStatus === 'suspended';
  const actionLabel = isSuspended ? 'Reactivate' : 'Suspend';
  const targetStatus = isSuspended ? 'active' : 'suspended';

  const handleToggleStatus = async () => {
    await dispatch(toggleSchoolStatus({ id: school._id, targetStatus }));
    setConfirmOpen(false);
  };

  return (
    <div className="school-detail-page">
      <PageHeader 
        title={school.name}
        subtitle={<span>Status: <StatusBadge status={schoolStatus} /></span>}
        action={
          <button 
            className={`btn-${isSuspended ? 'success' : 'danger'}`}
            onClick={() => setConfirmOpen(true)}
          >
            {actionLabel} School
          </button>
        }
      />

      <div className="detail-cards-grid">
        <div className="detail-card">
          <div className="detail-card__header">
            <Building2 size={20} className="detail-icon" />
            <h3>School Information</h3>
          </div>
          <div className="detail-card__body">
            <div className="detail-row">
              <span className="detail-label"><Mail size={16} /> Email</span>
              <span className="detail-value">{school.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label"><Phone size={16} /> Phone</span>
              <span className="detail-value">{school.phone}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label"><MapPin size={16} /> Address</span>
              <span className="detail-value">{school.address}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label"><Calendar size={16} /> Registered On</span>
              <span className="detail-value">{new Date(school.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-card__header">
            <UserCheck size={20} className="detail-icon" />
            <h3>Principal / Admin</h3>
          </div>
          <div className="detail-card__body">
            {school.principalId ? (
              <>
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{school.principalId.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{school.principalId.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{school.principalId.phone || 'N/A'}</span>
                </div>
              </>
            ) : (
              <p className="no-data">Principal information not available.</p>
            )}
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-card__header">
            <h3>Subscription Plan</h3>
          </div>
          <div className="detail-card__body">
            {school.subscription ? (
              <>
                <div className="detail-row">
                  <span className="detail-label">Plan</span>
                  <span className="detail-value status-badge badge-active">
                     {school.subscription.planId?.name || 'Standard'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Renewal Date</span>
                  <span className="detail-value">
                     {school.subscription.endDate ? new Date(school.subscription.endDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </>
            ) : (
              <p className="no-data">No active subscription found.</p>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title={`${actionLabel} School?`}
        message={`Are you sure you want to ${actionLabel.toLowerCase()} ${school.name}? ${isSuspended ? 'They will regain access.' : 'All users for this school will be locked out.'}`}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmOpen(false)}
        confirmText={actionLabel}
        isDestructive={!isSuspended}
        loading={actionLoading}
      />
    </div>
  );
};

export default SchoolDetailPage;
