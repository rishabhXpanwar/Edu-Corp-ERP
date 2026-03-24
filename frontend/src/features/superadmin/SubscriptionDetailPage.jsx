import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  fetchSubscriptionById,
  updateSubscriptionPlan,
  recordSubscriptionBilling,
  clearSelectedItem
} from './saSubscriptionsSlice.js';
import { updatePlanSchema, recordBillingSchema } from './saSubscriptionsSchemas.js';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import Spinner from '../../components/Spinner.jsx';
import DataTable from '../../components/DataTable.jsx';
import './SubscriptionDetailPage.css';

const SubscriptionDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedItem: subscription, loading, actionLoading } = useSelector((state) => state.saSubscriptions);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  const planForm = useForm({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: { plan: '' }
  });

  const billingForm = useForm({
    resolver: zodResolver(recordBillingSchema),
    defaultValues: { amount: '', method: 'bank_transfer', receiptUrl: '' }
  });

  useEffect(() => {
    dispatch(fetchSubscriptionById(id));
    return () => dispatch(clearSelectedItem());
  }, [dispatch, id]);

  useEffect(() => {
    if (subscription) {
      planForm.reset({ plan: subscription.plan });
    }
  }, [subscription, planForm]);

  const onPlanSubmit = async (data) => {
    await dispatch(updateSubscriptionPlan({ id, plan: data.plan })).unwrap();
    setIsPlanModalOpen(false);
  };

  const onBillingSubmit = async (data) => {
    await dispatch(recordSubscriptionBilling({ id, data })).unwrap();
    setIsBillingModalOpen(false);
    billingForm.reset();
  };

  if (loading || !subscription) return <Spinner />;

  const billingColumns = [
    {
      key: 'paidAt',
      label: 'Date',
      render: (value) => new Intl.DateTimeFormat('en-US').format(new Date(value)),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      key: 'method',
      label: 'Method',
    },
    {
      key: 'receiptUrl',
      label: 'Receipt',
      render: (value) => (value ? <a href={value} target="_blank" rel="noreferrer">View</a> : 'N/A'),
    },
  ];

  return (
    <div className="sa-subscription-detail">
      <PageHeader 
        title={`Subscription: ${subscription.schoolId?.name || 'Unknown'}`} 
      />

      <div className="detail-cards">
        <div className="card info-card">
          <h3>Current Status</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Status:</span>
              <StatusBadge status={subscription.status} />
            </div>
            <div className="info-item">
              <span className="label">Plan:</span>
              <span className="value capitalize">{subscription.plan}</span>
            </div>
            <div className="info-item">
              <span className="label">Start Date:</span>
              <span className="value">{new Intl.DateTimeFormat('en-US').format(new Date(subscription.startDate))}</span>
            </div>
            <div className="info-item">
              <span className="label">End Date:</span>
              <span className="value">{new Intl.DateTimeFormat('en-US').format(new Date(subscription.endDate))}</span>
            </div>
          </div>
          <div className="actions-row">
            <button className="btn btn-secondary" onClick={() => setIsPlanModalOpen(true)}>
              Change Plan
            </button>
            <button className="btn btn-primary" onClick={() => setIsBillingModalOpen(true)}>
              Record Payment
            </button>
          </div>
        </div>

        <div className="card school-card">
          <h3>School Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{subscription.schoolId?.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Phone:</span>
              <span className="value">{subscription.schoolId?.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card billing-history-card">
        <h3>Billing History</h3>
        {subscription.billing?.length > 0 ? (
          <DataTable columns={billingColumns} data={subscription.billing} />
        ) : (
          <p className="no-data">No billing history found.</p>
        )}
      </div>

      {/* Change Plan Modal */}
      <Modal 
        isOpen={isPlanModalOpen} 
        onClose={() => setIsPlanModalOpen(false)} 
        title="Change Subscription Plan"
      >
        <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="form-layout">
          <div className="form-group">
            <label>New Plan</label>
            <select {...planForm.register('plan')} className="form-control">
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
            {planForm.formState.errors.plan && <span className="error-text">{planForm.formState.errors.plan.message}</span>}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsPlanModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal 
        isOpen={isBillingModalOpen} 
        onClose={() => setIsBillingModalOpen(false)} 
        title="Record Manual Payment"
      >
        <form onSubmit={billingForm.handleSubmit(onBillingSubmit)} className="form-layout">
          <div className="form-group">
            <label>Amount</label>
            <input type="number" step="0.01" {...billingForm.register('amount')} className="form-control" />
            {billingForm.formState.errors.amount && <span className="error-text">{billingForm.formState.errors.amount.message}</span>}
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <select {...billingForm.register('method')} className="form-control">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
            </select>
            {billingForm.formState.errors.method && <span className="error-text">{billingForm.formState.errors.method.message}</span>}
          </div>
          <div className="form-group">
            <label>Receipt URL (optional)</label>
            <input type="text" {...billingForm.register('receiptUrl')} className="form-control" />
            {billingForm.formState.errors.receiptUrl && <span className="error-text">{billingForm.formState.errors.receiptUrl.message}</span>}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsBillingModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubscriptionDetailPage;
