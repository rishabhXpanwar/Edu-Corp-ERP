import React from 'react';
import './TimetablePage.css';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableGrid = ({ schedule = [], canEdit, onEditSlot }) => {
  // Build a map of day -> array with periods at their correct positions (using periodNumber)
  const scheduleMap = days.reduce((acc, day) => {
    const dayData = schedule.find(s => s.day === day);
    if (dayData && dayData.periods) {
      // Create an array with periods placed at their periodNumber positions
      const periodsArray = [];
      dayData.periods.forEach(period => {
        if (period) {
          const idx = typeof period.periodNumber === 'number' ? period.periodNumber : periodsArray.length;
          periodsArray[idx] = period;
        }
      });
      acc[day] = periodsArray;
    } else {
      acc[day] = [];
    }
    return acc;
  }, {});

  const maxPeriods = Math.max(0, ...Object.values(scheduleMap).map(p => p.length));
  const colsCount = Math.max(8, maxPeriods);
  const cols = Array.from({ length: colsCount }, (_, i) => i);

  return (
    <div className="timetable-grid-container">
      <div className="timetable-grid-scroll">
      <table className="timetable-grid">
        <thead>
          <tr>
            <th className="timetable-day-col">Day</th>
            {cols.map(col => (
              <th key={col}>Period {col + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map(day => {
            const periods = scheduleMap[day] || [];
            return (
              <tr key={day}>
                <td className="timetable-day-name">{day}</td>
                {cols.map(col => {
                  const period = periods[col];
                  return (
                    <td key={col} className={`timetable-cell ${period ? 'has-period' : 'empty-period'}`}>
                      {period ? (
                        <div className="period-content">
                          <span className="period-subject">{period.subject}</span>
                          <span className="period-time">{period.startTime} - {period.endTime}</span>
                          <span className="period-teacher">
                            {period.teacherId?.firstName 
                              ? `${period.teacherId.firstName} ${period.teacherId.lastName}` 
                              : (period.teacherId?.name || period.teacherId || period.sectionName)}
                          </span>
                        </div>
                      ) : (
                        <span className="period-unassigned">-</span>
                      )}
                      
                      {canEdit && (
                        <button 
                          className="btn-edit-slot"
                          type="button"
                          title="Edit slot"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditSlot(day, col, period);
                          }}
                        >
                          ✎
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default TimetableGrid;
