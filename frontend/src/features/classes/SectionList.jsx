import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteSection } from './classSlice.js';
import AddSectionModal from './AddSectionModal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

const SectionList = ({ classId, sections }) => {
  const dispatch = useDispatch();
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const handleOpenSectionModal = (sec = null) => {
    setSectionToEdit(sec);
    setIsSectionModalOpen(true);
  };

  const handleCloseSectionModal = () => {
    setSectionToEdit(null);
    setIsSectionModalOpen(false);
  };

  const handleDeleteSection = () => {
    if (sectionToDelete) {
      dispatch(deleteSection({ classId, sectionId: sectionToDelete }));
      setSectionToDelete(null);
    }
  };

  return (
    <div className="section-list">
      <div className="section-list__header">
        <h4>Sections</h4>
        <button 
          className="btn btn-small btn-outline" 
          onClick={() => handleOpenSectionModal()}
        >
          Add Section
        </button>
      </div>
      
      {sections.length === 0 ? (
        <p className="empty-text">No sections added yet.</p>
      ) : (
        <ul className="section-list__items">
          {sections.map(sec => (
            <li key={sec._id} className="section-list__item">
              <span>{sec.name} {sec.classTeacherId ? '(Teacher Assigned)' : ''}</span>
              <div className="section-list__actions">
                <button className="btn-icon btn-edit" title="Edit" onClick={() => handleOpenSectionModal(sec)}>&#9998;</button>
                <button className="btn-icon btn-delete" title="Delete" onClick={() => setSectionToDelete(sec._id)}>&times;</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isSectionModalOpen && (
        <AddSectionModal 
          isOpen={isSectionModalOpen} 
          onClose={handleCloseSectionModal}
          classId={classId}
          editingSection={sectionToEdit}
        />
      )}

      <ConfirmDialog
        isOpen={!!sectionToDelete}
        title="Delete Section"
        message="Are you sure you want to delete this section?"
        confirmText="Delete"
        onConfirm={handleDeleteSection}
        onCancel={() => setSectionToDelete(null)}
        isDanger={true}
      />
    </div>
  );
};

export default SectionList;
