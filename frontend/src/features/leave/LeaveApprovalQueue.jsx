import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { fetchLeaveQueue, reviewLeave } from './leaveSlice';
import { reviewLeaveSchema } from './leaveSchemas';

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }
  return new Date(value).toLocaleDateString();
};

const LeaveApprovalQueue = () => {
  const dispatch = useDispatch();
  const { queue, loading, pagination } = useSelector((state) => state.leave);
  const [currentPage, setCurrentPage] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('approved');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewLeaveSchema),
    defaultValues: {
      status: 'approved',
      reviewNote: '',
    },
  });

  const loadQueue = () => {
    dispatch(fetchLeaveQueue({ page: currentPage, limit: 20, status: 'pending' }));
  };

  useEffect(() => {
    loadQueue();
  }, [dispatch, currentPage]);

  const handleOpenReviewModal = (requestId, status) => {
    setSelectedRequestId(requestId);
    setSelectedStatus(status);
    reset({ status, reviewNote: '' });
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedRequestId('');
    setSelectedStatus('approved');
    reset({ status: 'approved', reviewNote: '' });
  };

  const onReviewSubmit = async (values) => {
    if (!selectedRequestId) {
      return;
    }

    const resultAction = await dispatch(
      reviewLeave({
        id: selectedRequestId,
        payload: {
          status: values.status,
          reviewNote: values.reviewNote?.trim() || undefined,
        },
      })
    );

    if (reviewLeave.fulfilled.match(resultAction)) {
      handleCloseReviewModal();
      loadQueue();
    }
  };

  const columns = [
    {
      key: 'applicant',
      label: 'Applicant',
      render: (_, row) => (
        <div className="leave-queue-applicant">
          <span className="leave-queue-applicant__name">{row.applicantId?.name || 'N/A'}</span>
          <span className="leave-queue-applicant__meta">{row.applicantId?.role || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => value || 'N/A',
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value) => value || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value || 'pending'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="leave-queue-actions">
          <button
            type="button"
            className="leave-queue-actions__btn leave-queue-actions__btn--approve"
            onClick={() => handleOpenReviewModal(row._id, 'approved')}
            disabled={loading}
          >
            Approve
          </button>
          <button
            type="button"
            className="leave-queue-actions__btn leave-queue-actions__btn--reject"
            onClick={() => handleOpenReviewModal(row._id, 'rejected')}
            disabled={loading}
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="leave-table-wrap">
      <DataTable
        columns={columns}
        data={queue}
        loading={loading}
        emptyText="No pending leave requests in the queue."
      />

      {pagination.totalPages > 1 && (
        <div className="leave-table-wrap__pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            perPage={pagination.limit}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <Modal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        title={selectedStatus === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
      >
        <form className="leave-review-form" onSubmit={handleSubmit(onReviewSubmit)}>
          <input type="hidden" value={selectedStatus} {...register('status')} />

          <div className="leave-review-form__field">
            <label htmlFor="leave-review-note" className="leave-form__label">Review Note (optional)</label>
            <textarea
              id="leave-review-note"
              className="leave-form__input leave-form__textarea"
              placeholder="Add a short note for this decision"
              disabled={loading}
              {...register('reviewNote')}
            />
            {errors.reviewNote && (
              <span className="leave-form__error">{errors.reviewNote.message}</span>
            )}
          </div>

          <div className="leave-form__actions">
            <button
              type="button"
              className="leave-form__button leave-form__button--ghost"
              onClick={handleCloseReviewModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="leave-form__button"
              disabled={loading}
            >
              {loading ? 'Saving...' : selectedStatus === 'approved' ? 'Confirm Approve' : 'Confirm Reject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveApprovalQueue;
