import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentResults, clearResultData } from './resultSlice';
import { fetchExams } from '../exams/examSlice';
import { fetchStudents } from '../students/studentSlice';
import PageHeader from '../../components/PageHeader';
import ResultSummaryCard from './ResultSummaryCard';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import './ResultsPage.css';

const ResultsPage = () => {
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => state.auth);
  const { studentResults, loading: resultLoading, error } = useSelector(state => state.result);
  const { items: exams, loading: examsLoading } = useSelector(state => state.exam);
  const { students = [], loading: studentsLoading } = useSelector(state => state.students);

  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  const isStudentOrParent = ['student', 'parent'].includes(user?.role);

  useEffect(() => {
    dispatch(fetchExams({ limit: 100 }));
    if (!isStudentOrParent) {
      dispatch(fetchStudents({ limit: 100 }));
    } else {
      setSelectedStudentId(user?._id);
    }
    
    return () => dispatch(clearResultData());
  }, [dispatch, isStudentOrParent, user]);

  const handleFetchResults = () => {
    if (!selectedExamId || !selectedStudentId) return;
    dispatch(fetchStudentResults({ studentId: selectedStudentId, examId: selectedExamId }));
  };

  const isLoading = examsLoading || studentsLoading;

  if (isLoading && exams.length === 0) {
    return <Spinner />;
  }

  const hasData = Array.isArray(studentResults?.subjects) && studentResults.subjects.length > 0;

  return (
    <div className="results-page-container">
      <PageHeader 
        title="Student Results" 
        subtitle="View exam performance and report cards" 
      />

      <div className="results-filters-card">
        <div className="filter-group form-group">
          <label className="form-label">Select Exam</label>
          <select 
            className="filter-select form-input"
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
          >
            <option value="">-- Choose Exam --</option>
            {exams.map(exam => (
              <option key={exam._id} value={exam._id}>{exam.title}</option>
            ))}
          </select>
        </div>

        {!isStudentOrParent && (
          <div className="filter-group form-group">
            <label className="form-label">Select Student</label>
            <select 
              className="filter-select form-input"
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- Choose Student --</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName} ({student.rollNumber || student.admissionNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        <button 
          className="btn-fetch"
          onClick={handleFetchResults}
          disabled={!selectedExamId || !selectedStudentId || resultLoading}
        >
          {resultLoading ? 'Loading...' : 'View Results'}
        </button>
      </div>

      <div className="results-content">
        {resultLoading ? (
          <Spinner />
        ) : error && typeof error === 'string' && error.toLowerCase().includes('not found') ? (
          <EmptyState title="No Results Found" message="Results for this selection are not available or not yet published." />
        ) : hasData ? (
          <div className="results-card">
            <ResultSummaryCard results={studentResults} />
            
            <div className="results-subject-card">
              <h3 className="section-title">Subject-Wise Performance</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th className="text-center">Max Marks</th>
                      <th className="text-center">Obtained</th>
                      <th className="text-center">Grade / Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentResults.subjects.map((sub, idx) => (
                      <tr key={idx}>
                        <td className="font-medium">{sub.subjectName}</td>
                        <td className="text-center">{sub.totalMarks}</td>
                        <td className="text-center highlight-score">{sub.obtainedMarks}</td>
                        <td className="text-center">{sub.grade || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="placeholder-state">
            <p className="text-secondary">Select an exam and student to view results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
