import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';

const AdmissionStep4 = () => {
  const { getValues } = useFormContext();
  const { classes } = useSelector(state => state.classes);
  
  const values = getValues();
  const selectedClass = classes.find(c => c._id === values.student.classId);
  const selectedSection = selectedClass?.sections?.find(s => s._id === values.student.sectionId);

  return (
    <div className="step-content">
      <h3>Review & Submit</h3>
      <p className="description">Please review the details below before finalizing the admission.</p>

      <div className="review-section">
        <h4>Student Details</h4>
        <div className="review-row"><span>Name:</span> <strong>{values.student.name}</strong></div>
        <div className="review-row"><span>Email:</span> <strong>{values.student.email}</strong></div>
        <div className="review-row"><span>Phone:</span> <strong>{values.student.phone}</strong></div>
      </div>

      <div className="review-section">
        <h4>Academic Details</h4>
        <div className="review-row"><span>Admission No:</span> <strong>{values.student.admissionNumber}</strong></div>
        <div className="review-row"><span>Class:</span> <strong>{selectedClass?.name || 'N/A'}</strong></div>
        <div className="review-row"><span>Section:</span> <strong>{selectedSection?.name || 'N/A'}</strong></div>
      </div>

      <div className="review-section">
        <h4>Parent Details</h4>
        <div className="review-row"><span>Name:</span> <strong>{values.parent.name}</strong></div>
        <div className="review-row"><span>Email:</span> <strong>{values.parent.email}</strong></div>
        <div className="review-row"><span>Phone:</span> <strong>{values.parent.phone}</strong></div>
      </div>
    </div>
  );
};

export default AdmissionStep4;
