import React, { useMemo } from 'react';
import EventBadge from './EventBadge.jsx';
import './CalendarGrid.css';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toDateKey = (dateValue) => {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildCalendarCells = (year, month) => {
  const firstDayDate = new Date(year, month - 1, 1);
  const totalDays = new Date(year, month, 0).getDate();
  const leadingEmptyCount = firstDayDate.getDay();

  const cells = [];

  for (let i = 0; i < leadingEmptyCount; i += 1) {
    cells.push({ type: 'outside', key: `leading-${i}` });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const cellDate = new Date(year, month - 1, day);
    cells.push({
      type: 'day',
      key: `day-${day}`,
      day,
      dateKey: toDateKey(cellDate),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ type: 'outside', key: `trailing-${cells.length}` });
  }

  return cells;
};

const CalendarGrid = ({ year, month, events, onAddClick, canEdit = false }) => {
  const todayDateKey = toDateKey(new Date());

  const eventMap = useMemo(() => {
    const map = {};

    events.forEach((event) => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);

      let cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      while (cursor <= endDay) {
        const key = toDateKey(cursor);
        if (!map[key]) {
          map[key] = [];
        }

        map[key].push(event);
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    return map;
  }, [events]);

  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);

  return (
    <div className="calendar-grid">
      <div className="calendar-grid__weekdays">
        {DAY_NAMES.map((dayName) => (
          <div key={dayName} className="calendar-grid__weekday">
            {dayName}
          </div>
        ))}
      </div>

      <div className="calendar-grid__body">
        {cells.map((cell) => {
          if (cell.type === 'outside') {
            return <div key={cell.key} className="calendar-day calendar-day--outside" />;
          }

          const dayEvents = eventMap[cell.dateKey] || [];
          const visibleEvents = dayEvents.slice(0, 3);
          const remainingCount = dayEvents.length - visibleEvents.length;

          return (
            <div
              key={cell.key}
              className={`calendar-day ${cell.dateKey === todayDateKey ? 'calendar-day--today' : ''}`}
            >
              <div className="calendar-day__header">
                <span className="calendar-day__number">{cell.day}</span>
                {canEdit && (
                  <button
                    type="button"
                    className="calendar-day__add-btn"
                    onClick={() => onAddClick?.(cell.dateKey)}
                    aria-label={`Add event on ${cell.dateKey}`}
                  >
                    +
                  </button>
                )}
              </div>

              <div className="calendar-day__events">
                {visibleEvents.map((event) => (
                  <EventBadge key={event._id} event={event} />
                ))}

                {remainingCount > 0 && (
                  <span className="calendar-day__more-chip">
                    +{remainingCount} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
