import React from 'react';
import './ExamsPage.css';

const DateSheetView = ({ dateSheet }) => {
  if (!dateSheet || dateSheet.length === 0) {
    return <div className="date-sheet-empty">No schedule available for this exam.</div>;
  }

  return (
    <div className="date-sheet-container">
      <table className="date-sheet-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Class / Section</th>
            <th>Subject</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {dateSheet.map((row, index) => (
            <tr key={index}>
              <td>{new Date(row.date).toLocaleDateString()}</td>
              <td>
                {row.classId?.name || 'Unknown Class'} {row.sectionId?.name ? `- ${row.sectionId.name}` : ''}
              </td>
              <td>{row.subject}</td>
              <td>
                {row.startTime} - {row.endTime}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DateSheetView;
