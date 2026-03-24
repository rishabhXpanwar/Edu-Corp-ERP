import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import Spinner from '../../components/Spinner.jsx';
import { ROLES } from '../../constants/roles.js';
import AddEventModal from './AddEventModal.jsx';
import CalendarGrid from './CalendarGrid.jsx';
import {
  fetchEvents,
  goToNextMonth,
  goToPrevMonth,
  selectCalendarError,
  selectCalendarEvents,
  selectCalendarLoading,
  selectCurrentMonth,
  selectCurrentYear,
} from './calendarSlice.js';
import './CalendarPage.css';

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const EDIT_ROLES = [ROLES.PRINCIPAL, ROLES.ACADEMIC_MANAGER, ROLES.ADMIN_MANAGER];

const CalendarPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const events = useSelector(selectCalendarEvents);
  const loading = useSelector(selectCalendarLoading);
  const error = useSelector(selectCalendarError);
  const currentMonth = useSelector(selectCurrentMonth);
  const currentYear = useSelector(selectCurrentYear);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultDate, setModalDefaultDate] = useState('');

  const monthLabel = useMemo(
    () => `${MONTH_LABELS[currentMonth - 1]} ${currentYear}`,
    [currentMonth, currentYear],
  );

  const canEdit = useMemo(
    () => EDIT_ROLES.includes(user?.role),
    [user?.role],
  );

  useEffect(() => {
    dispatch(fetchEvents({ month: currentMonth, year: currentYear }));
  }, [dispatch, currentMonth, currentYear]);

  const handlePrevMonth = () => {
    dispatch(goToPrevMonth());
  };

  const handleNextMonth = () => {
    dispatch(goToNextMonth());
  };

  const handleAddFromGrid = (dateString) => {
    setModalDefaultDate(dateString);
    setIsModalOpen(true);
  };

  const headerAction = (
    <div className="calendar-page__actions">
      <div className="calendar-page__nav-controls">
        <button
          type="button"
          className="calendar-page__nav-btn"
          onClick={handlePrevMonth}
          aria-label="Go to previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="calendar-page__month-label">{monthLabel}</span>
        <button
          type="button"
          className="calendar-page__nav-btn"
          onClick={handleNextMonth}
          aria-label="Go to next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {canEdit && (
        <button
          type="button"
          className="calendar-page__add-btn"
          onClick={() => {
            setModalDefaultDate('');
            setIsModalOpen(true);
          }}
        >
          Add Event
        </button>
      )}
    </div>
  );

  return (
    <div className="calendar-page school-panel">
      <PageHeader title="Calendar" subtitle="School-wide events and holidays" action={headerAction} />

      {error && <div className="calendar-page__error">{error}</div>}

      {loading ? (
        <div className="calendar-page__loading">
          <Spinner />
        </div>
      ) : (
        <CalendarGrid
          year={currentYear}
          month={currentMonth}
          events={events}
          canEdit={canEdit}
          onAddClick={handleAddFromGrid}
        />
      )}

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={modalDefaultDate}
      />
    </div>
  );
};

export default CalendarPage;
