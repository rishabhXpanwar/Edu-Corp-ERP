import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses } from '../classes/classSlice';
import { fetchExams } from '../exams/examSlice';
import { fetchStudents } from '../students/studentSlice';
import { fetchSectionMarks, saveMarks, publishSectionMarks, clearMarksData } from './marksSlice';
import MarksEntryTable from './MarksEntryTable';
import PublishConfirmModal from '../results/PublishConfirmModal';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import './MarksPage.css';

const MarksPage = () => {
  const dispatch = useDispatch();

  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  const { classes, loading: classesLoading } = useSelector(state => state.classes);
  const { items: exams, loading: examsLoading } = useSelector(state => state.exam);
  const { students, loading: studentsLoading } = useSelector(state => state.students);
  const { sectionMarks, loading: marksLoading, saveLoading, error } = useSelector(state => state.marks);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchExams({ limit: 100 }));
    // Cleanup on unmount
    return () => dispatch(clearMarksData());
  }, [dispatch]);

  const selectedClass = classes.find(c => c._id === selectedClassId);
  const sections = selectedClass?.sections || [];
  
  const selectedExam = exams.find(e => e._id === selectedExamId);

  // Derive subjects for the selected class/section from the selected exam's dateSheet
  const subjects = useMemo(() => {
    if (!selectedExam || !selectedExam.dateSheet) return [];
    // Depending on dateSheet structure, either filter by section or class
    // Assume dateSheet has sectionId populated or objectId
    const sheet = selectedExam.dateSheet.filter(ds => {
      const secId = typeof ds.sectionId === 'object' ? ds.sectionId._id : ds.sectionId;
      return secId === selectedSectionId;
    });
    // extract unique subjects
    const uniqueSubs = new Set(sheet.map(s => s.subject));
    
    // Fallback: If no dateSheet specific to section, maybe we have sectionMarks
    if (uniqueSubs.size === 0 && sectionMarks && sectionMarks.length > 0) {
      sectionMarks[0].subjects.forEach(sub => uniqueSubs.add(sub.subjectName));
    }
    
    return Array.from(uniqueSubs);
  }, [selectedExam, selectedSectionId, sectionMarks]);

  const handleFetchMarks = () => {
    if (!selectedExamId || !selectedClassId || !selectedSectionId) {
      toast.error('Please select Exam, Class, and Section');
      return;
    }
    
    dispatch(fetchStudents({ classId: selectedClassId, sectionId: selectedSectionId, limit: 100 }))
      .unwrap()
      .then(() => {
        dispatch(fetchSectionMarks({ examId: selectedExamId, sectionId: selectedSectionId }))
          .unwrap()
          .then(() => setDataFetched(true))
          .catch(() => setDataFetched(true));
      })
      .catch((err) => toast.error('Failed to fetch students'));
  };

  const handleSaveMarks = (payloadData) => {
    dispatch(saveMarks({
      examId: selectedExamId,
      sectionId: selectedSectionId,
      marksData: payloadData
    })).unwrap().then(() => {
      // Refresh section marks
      dispatch(fetchSectionMarks({ examId: selectedExamId, sectionId: selectedSectionId }));
    });
  };

  const handlePublishClick = () => {
    setIsPublishModalOpen(true);
  };

  const handlePublishConfirm = async () => {
    try {
      await dispatch(publishSectionMarks({ examId: selectedExamId, sectionId: selectedSectionId })).unwrap();
      setIsPublishModalOpen(false);
      // Refresh to get updated status
      dispatch(fetchSectionMarks({ examId: selectedExamId, sectionId: selectedSectionId }));
    } catch (err) {
      // Error is handled in thunk
    }
  };

  // Determine if published
  const isPublished = sectionMarks.length > 0 && sectionMarks.every(sm => sm.status === 'published');

  const pageLoading = classesLoading || examsLoading;
  const isFetchingMarks = studentsLoading || marksLoading;

  if (pageLoading && !classes.length && !exams.length) {
    return <Spinner />;
  }

  return (
    <div className="marks-page-container">
      <PageHeader 
        title="Marks Entry" 
        subtitle="Record and publish marks for upcoming or ongoing exams" 
      />

      <div className="marks-filters-card">
        <div className="filter-group">
          <label>Exam</label>
          <select 
            className="filter-select"
            value={selectedExamId}
            onChange={e => {
              setSelectedExamId(e.target.value);
              setDataFetched(false);
            }}
          >
            <option value="">-- Select Exam --</option>
            {exams.map(exam => (
              <option key={exam._id} value={exam._id}>{exam.title}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Class</label>
          <select 
            className="filter-select"
            value={selectedClassId}
            onChange={e => {
              setSelectedClassId(e.target.value);
              setSelectedSectionId('');
              setDataFetched(false);
            }}
          >
            <option value="">-- Select Class --</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Section</label>
          <select 
            className="filter-select"
            value={selectedSectionId}
            onChange={e => {
              setSelectedSectionId(e.target.value);
              setDataFetched(false);
            }}
            disabled={!selectedClassId}
          >
            <option value="">-- Select Section --</option>
            {sections.map(sec => (
              <option key={sec._id} value={sec._id}>{sec.name}</option>
            ))}
          </select>
        </div>

        <button 
          className="btn-fetch"
          onClick={handleFetchMarks}
          disabled={!selectedExamId || !selectedSectionId || isFetchingMarks}
        >
          {isFetchingMarks ? 'Loading...' : 'Fetch Marks'}
        </button>
      </div>

      {dataFetched && !isFetchingMarks && (
        <>
          {subjects.length === 0 ? (
            <EmptyState 
              title="No subjects configured" 
              message="No date sheet/subjects found for this section in the selected exam." 
            />
          ) : (
            <MarksEntryTable 
              students={students}
              sectionMarks={sectionMarks}
              subjects={subjects}
              onSave={handleSaveMarks}
              isSaving={saveLoading}
              isPublished={isPublished}
              isPublishing={marksLoading}
              onPublish={handlePublishClick}
            />
          )}
        </>
      )}

      {dataFetched && isFetchingMarks && <Spinner />}

      <PublishConfirmModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublishConfirm}
        loading={marksLoading}
      />
    </div>
  );
};

export default MarksPage;
