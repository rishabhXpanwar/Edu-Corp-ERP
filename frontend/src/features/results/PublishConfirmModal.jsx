import React from 'react';
import ConfirmDialog from '../../components/ConfirmDialog';

const PublishConfirmModal = ({ isOpen, onClose, onConfirm, loading }) => {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Publish Marks"
      message="Are you sure you want to publish these marks? Once published, marks will be visible to students and parents and cannot be edited. This action cannot be undone."
      confirmText={loading ? 'Publishing...' : 'Publish'}
      confirmColor="var(--success-color)"
    />
  );
};

export default PublishConfirmModal;
