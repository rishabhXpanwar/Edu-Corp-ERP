import { combineReducers } from '@reduxjs/toolkit';
import uiReducer from './uiSlice.js';
import authReducer from '../features/auth/authSlice.js';
import saSchoolsReducer from '../features/superadmin/saSchoolsSlice.js';
import saSubscriptionsReducer from '../features/superadmin/saSubscriptionsSlice.js';
import profileReducer from '../features/profile/profileSlice.js';
import classReducer from '../features/classes/classSlice.js';
import studentReducer from '../features/students/studentSlice.js';
import teacherReducer from '../features/teachers/teacherSlice.js';
import managerReducer from '../features/managers/managerSlice.js';
import attendanceReducer from '../features/attendance/attendanceSlice.js';
import timetableReducer from '../features/timetable/timetableSlice.js';
import examReducer from '../features/exams/examSlice.js';
import marksReducer from '../features/marks/marksSlice.js';
import resultReducer from '../features/results/resultSlice.js';
import reportCardReducer from '../features/reportCards/reportCardSlice.js';
import assignmentReducer from '../features/assignments/assignmentSlice.js';
import feeReducer from '../features/fees/feeSlice.js';
import salaryReducer from '../features/salaries/salarySlice.js';
import leaveReducer from '../features/leave/leaveSlice.js';
import libraryReducer from '../features/library/librarySlice.js';
import transportReducer from '../features/transport/transportSlice.js';
import notificationReducer from '../features/notifications/notificationSlice.js';
import announcementReducer from '../features/announcements/announcementSlice.js';
import calendarReducer from '../features/calendar/calendarSlice.js';
import dashboardReducer from '../features/dashboard/dashboardSlice.js';
import auditReducer from '../features/audit/auditSlice.js';
import settingsReducer from '../features/settings/settingsSlice.js';

const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  saSchools: saSchoolsReducer,
  saSubscriptions: saSubscriptionsReducer,
  profile: profileReducer,
  classes: classReducer,
  students: studentReducer,
  teachers: teacherReducer,
  managers: managerReducer,
  attendance: attendanceReducer,
  timetable: timetableReducer,
  exam: examReducer,
  marks: marksReducer,
  result: resultReducer,
  reportCard: reportCardReducer,
  assignment: assignmentReducer,
  fee: feeReducer,
  salary: salaryReducer,
  leave: leaveReducer,
  library: libraryReducer,
  transport: transportReducer,
  notification: notificationReducer,
  announcement: announcementReducer,
  calendar: calendarReducer,
  dashboard: dashboardReducer,
  audit: auditReducer,
  settings: settingsReducer,
});

export default rootReducer;
