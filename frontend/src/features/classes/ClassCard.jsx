import React, { useState } from 'react';
import SectionList from './SectionList.jsx';
import './ClassCard.css';

const ClassCard = ({ classObj, onEdit, onDelete }) => {
  return (
    <div className="class-card">
      <div className="class-card__header">
        <div>
          <h3>{classObj.name}</h3>
          <span className="class-card__level">Level: {classObj.level}</span>
        </div>
        <div className="class-card__actions">
          <button className="btn btn-icon btn-edit" onClick={() => onEdit(classObj)} title="Edit Class">
            &#9998;
          </button>
          <button className="btn btn-icon btn-delete" onClick={() => onDelete(classObj._id)} title="Delete Class">
            &times;
          </button>
        </div>
      </div>
      <div className="class-card__content">
        <SectionList classId={classObj._id} sections={classObj.sections || []} />
      </div>
    </div>
  );
};

export default ClassCard;
