import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { admissionSchema } from './studentSchemas.js';
import { createStudent } from './studentSlice.js';
import AdmissionStep1 from './AdmissionStep1.jsx';
import AdmissionStep2 from './AdmissionStep2.jsx';
import AdmissionStep3 from './AdmissionStep3.jsx';
import AdmissionStep4 from './AdmissionStep4.jsx';
import './StudentAdmissionPage.css';

const STEPS = ['Student Profile', 'Academic Details', 'Parent Details', 'Review'];

const StudentAdmissionPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const methods = useForm({
    resolver: zodResolver(admissionSchema),
    mode: 'onTouched',
    defaultValues: {
      student: { name: '', email: '', phone: '', password: '', admissionNumber: '', classId: '', sectionId: '', avatarUrl: '' },
      parent: { name: '', email: '', phone: '', password: '', avatarUrl: '' }
    }
  });

  const { handleSubmit, trigger } = methods;

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (activeStep === 0) fieldsToValidate = ['student.name', 'student.email', 'student.phone', 'student.password'];
    else if (activeStep === 1) fieldsToValidate = ['student.admissionNumber', 'student.classId', 'student.sectionId'];
    else if (activeStep === 2) fieldsToValidate = ['parent.name', 'parent.email', 'parent.phone', 'parent.password'];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(0, prev - 1));
  };

  const onSubmit = (data) => {
    dispatch(createStudent(data)).unwrap().then((newStudentInfo) => {
      navigate('/students'); // Route back to the list on success
    });
  };

  return (
    <div className="admission-page">
      <div className="admission-page__header">
        <h1>Student Admission</h1>
      </div>

      <div className="stepper">
        {STEPS.map((label, idx) => (
          <div key={label} className={`stepper__step ${idx === activeStep ? 'active' : ''} ${idx < activeStep ? 'completed' : ''}`}>
            <div className="stepper__circle">{idx + 1}</div>
            <div className="stepper__label">{label}</div>
          </div>
        ))}
      </div>

      <div className="admission-form-container">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {activeStep === 0 && <AdmissionStep1 />}
            {activeStep === 1 && <AdmissionStep2 />}
            {activeStep === 2 && <AdmissionStep3 />}
            {activeStep === 3 && <AdmissionStep4 />}

            <div className="stepper-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleBack} 
                disabled={activeStep === 0}
              >
                Back
              </button>
              
              {activeStep < STEPS.length - 1 ? (
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button type="submit" className="btn btn-primary">
                  Submit Admission
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default StudentAdmissionPage;
