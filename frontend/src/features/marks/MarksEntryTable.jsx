import React, { useState, useEffect } from 'react';

const MarksEntryTable = ({
  students,
  sectionMarks,
  subjects,
  onSave,
  isSaving,
  isPublished,
  isPublishing,
  onPublish
}) => {
  const [marksData, setMarksData] = useState({});

  useEffect(() => {
    if (sectionMarks && sectionMarks.length > 0) {
      const data = {};
      sectionMarks.forEach(sm => {
        data[sm.studentId._id] = {};
        sm.subjects.forEach(sub => {
          data[sm.studentId._id][sub.subjectName] = {
            obtainedMarks: sub.obtainedMarks,
            totalMarks: sub.totalMarks,
            grade: sub.grade || ''
          };
        });
      });
      setMarksData(data);
    } else {
      setMarksData({});
    }
  }, [sectionMarks]);

  const handleMarkChange = (studentId, subjectName, field, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectName]: {
          ...(prev[studentId]?.[subjectName] || { totalMarks: 100, obtainedMarks: 0, grade: '' }),
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    const payload = [];
    students.forEach(student => {
      const studentData = marksData[student._id] || {};
      const subjectsArray = subjects.map(subName => {
        const subData = studentData[subName] || { obtainedMarks: 0, totalMarks: 100, grade: '' };
        return {
          subjectName: subName,
          obtainedMarks: Number(subData.obtainedMarks) || 0,
          totalMarks: Number(subData.totalMarks) || 100,
          grade: subData.grade || ''
        };
      });
      payload.push({
        studentId: student._id,
        subjects: subjectsArray
      });
    });
    onSave(payload);
  };

  return (
    <div className="marks-table-container">
      <div className="marks-table-actions">
        {isPublished ? (
          <span className="published-badge card-badge">Status: Published (Read-Only)</span>
        ) : (
          <div className="action-buttons">
            <button onClick={handleSave} disabled={isSaving || isPublishing} className="btn-secondary">
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={onPublish} disabled={isSaving || isPublishing} className="btn-primary">
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        )}
      </div>

      <div className="table-responsive marks-grid">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sticky-col">Roll No.</th>
              <th className="sticky-col-2">Student Name</th>
              {subjects.map(sub => (
                <th key={sub} colSpan="2" className="text-center">{sub}</th>
              ))}
            </tr>
            <tr className="sub-header">
              <th className="sticky-col"></th>
              <th className="sticky-col-2"></th>
              {subjects.map(sub => (
                <React.Fragment key={`${sub}-sub`}>
                  <th className="text-center">Obt.</th>
                  <th className="text-center">Max</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={subjects.length * 2 + 2} className="empty-state-cell">No students found</td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student._id}>
                  <td className="sticky-col">{student.rollNumber || '-'}</td>
                  <td className="sticky-col-2">{student.firstName} {student.lastName}</td>
                  {subjects.map(sub => {
                    const data = marksData[student._id]?.[sub] || { obtainedMarks: '', totalMarks: 100 };
                    return (
                      <React.Fragment key={`${student._id}-${sub}`}>
                        <td className="compact-cell">
                          <input
                            type="number"
                            min="0"
                            max={data.totalMarks}
                            value={data.obtainedMarks}
                            onChange={(e) => handleMarkChange(student._id, sub, 'obtainedMarks', e.target.value)}
                            disabled={isPublished}
                            className="compact-input"
                          />
                        </td>
                        <td className="compact-cell">
                          <input
                            type="number"
                            min="1"
                            value={data.totalMarks}
                            onChange={(e) => handleMarkChange(student._id, sub, 'totalMarks', e.target.value)}
                            disabled={isPublished}
                            className="compact-input readonly-input"
                            readOnly
                          />
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarksEntryTable;
