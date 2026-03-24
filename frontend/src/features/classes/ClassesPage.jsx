import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, fetchAcademicYears, deleteClass } from './classSlice.js';
import AcademicYearPanel from './AcademicYearPanel.jsx';
import ClassCard from './ClassCard.jsx';
import AddClassModal from './AddClassModal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import './ClassesPage.css';

const ClassesPage = () => {
  const dispatch = useDispatch();
  const { classes, loading, error } = useSelector((state) => state.classes);
  const classList = Array.isArray(classes) ? classes : [];
  
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState(null);
  const [classToDelete, setClassToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAcademicYears());
    dispatch(fetchClasses());
  }, [dispatch]);

  const handleOpenClassModal = (cls = null) => {
    setClassToEdit(cls);
    setIsClassModalOpen(true);
  };

  const handleCloseClassModal = () => {
    setClassToEdit(null);
    setIsClassModalOpen(false);
  };

  const handleDeleteClass = (id) => {
    dispatch(deleteClass(id));
    setClassToDelete(null);
  };

  if (loading && !classList.length) return <Spinner />;
  if (error) return <EmptyState title="Error Loading Classes" description={error.message} />;

  return (
    <div className="classes-page">
      <div className="classes-page__header">
        <h1>Classes & Academic Years</h1>
        <button className="btn btn-primary" onClick={() => handleOpenClassModal()}>
          Add Class
        </button>
      </div>

      <AcademicYearPanel />

      <div className="classes-page__content">
        {classList.length === 0 ? (
          <EmptyState 
            title="No Classes Found" 
            description="Add your first class to get started." 
            actionLabel="Add Class"
            onAction={() => handleOpenClassModal()}
          />
        ) : (
          <div className="classes-grid">
            {classList.map((cls) => (
              <ClassCard 
                key={cls._id} 
                classObj={cls} 
                onEdit={() => handleOpenClassModal(cls)}
                onDelete={() => setClassToDelete(cls._id)}
              />
            ))}
          </div>
        )}
      </div>

      {isClassModalOpen && (
        <AddClassModal 
          isOpen={isClassModalOpen} 
          onClose={handleCloseClassModal} 
          editingClass={classToEdit} 
        />
      )}

      {classToDelete && (
        <ConfirmDialog
          isOpen={!!classToDelete}
          title="Delete Class"
          message="Are you sure you want to delete this class? This will also delete all associated sections."
          confirmText="Delete"
          onConfirm={() => handleDeleteClass(classToDelete)}
          onCancel={() => setClassToDelete(null)}
          isDanger={true}
        />
      )}
    </div>
  );
};

export default ClassesPage;
