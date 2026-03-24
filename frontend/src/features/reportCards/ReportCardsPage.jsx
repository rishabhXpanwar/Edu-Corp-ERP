import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExams } from '../exams/examSlice';
import { downloadReportCard } from './reportCardSlice';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import './ReportCardsPage.css';

const ReportCardsPage = () => {
  const dispatch = useDispatch();
  const { items: exams, loading: examsLoading } = useSelector((state) => state.exam);
  const { loading: downloading } = useSelector((state) => state.reportCard);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    // If the user has children (parent), set default selected student
    if (user?.role === 'parent' && user?.children?.length > 0) {
      setSelectedStudent(user.children[0]._id || user.children[0]); 
    } else if (user?.role === 'student') {
      setSelectedStudent(user._id);
    }
  }, [user]);

  useEffect(() => {
    // Fetch exams - mostly we care about 'completed' or 'published' status, 
    // but the backend will return what is available based on school/auth.
    dispatch(fetchExams({}));
  }, [dispatch]);

  const handleDownload = (exam) => {
    let studentId = selectedStudent || user._id;

    if (!studentId && user?.role === 'parent') {
      alert("Please select a student first.");
      return;
    }
    
    dispatch(downloadReportCard({
      studentId,
      examId: exam._id,
      filename: `${exam.title.replace(/\s+/g, '_')}_ReportCard.pdf`
    }));
  };

  return (
    <div className="report-cards-page">
      <PageHeader title="Report Cards" />
      
      {/* Target audience includes parents who may have multiple children */}
      {user?.role === 'parent' && user?.children?.length > 0 && (
        <div className="report-cards-filter">
          <label>Select Student: </label>
          <select 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="input"
          >
            {user.children.map((child) => (
              <option key={child._id || child} value={child._id || child}>
                {child.firstName ? `${child.firstName} ${child.lastName}` : `Student ID: ${child}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="report-cards-content">
        {examsLoading ? (
          <Spinner />
        ) : exams && exams.length > 0 ? (
          <div className="exam-cards-grid">
            {exams.map((exam) => (
              <div key={exam._id} className="exam-report-card">
                <div className="exam-report-card__info">
                  <h3>{exam.title}</h3>
                  <p className="text-secondary">
                    <span role="img" aria-label="calendar">📅</span>
                    {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="exam-report-card__actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleDownload(exam)}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <Spinner size="sm" /> 
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <span role="img" aria-label="download">⬇️</span>
                        <span>Download Report Card</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon="📄" 
            title="No Exams Found" 
            subtitle="No exams are available for report card generation right now." 
          />
        )}
      </div>
    </div>
  );
};

export default ReportCardsPage;
