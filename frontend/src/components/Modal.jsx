import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '520px', footer }) => {
  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-panel" 
        role="dialog" 
        aria-modal="true"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-panel__header">
          <h2 className="modal-panel__title">{title}</h2>
          <button 
            className="modal-panel__close" 
            onClick={onClose}
            type="button" 
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="modal-panel__body">
          {children}
        </div>
        {footer && (
          <div className="modal-panel__footer">{footer}</div>
        )}
      </div>
    </div>
  );
};

export default Modal;
