import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import * as calendarApi from './calendarService.js';

const now = new Date();

const initialState = {
  events: [],
  loading: false,
  error: null,
  currentMonth: now.getMonth() + 1,
  currentYear: now.getFullYear(),
};

export const fetchEvents = createAsyncThunk(
  'calendar/fetchEvents',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const data = await calendarApi.fetchEvents({ month, year });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
    }
  },
);

export const createEvent = createAsyncThunk(
  'calendar/createEvent',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await calendarApi.createEvent(payload);
      toast.success('Event added');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create event';
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const deleteEvent = createAsyncThunk(
  'calendar/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      await calendarApi.deleteEvent(id);
      toast.success('Event deleted');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete event';
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setCurrentMonth: (state, action) => {
      state.currentMonth = action.payload;
    },
    setCurrentYear: (state, action) => {
      state.currentYear = action.payload;
    },
    goToPrevMonth: (state) => {
      if (state.currentMonth === 1) {
        state.currentMonth = 12;
        state.currentYear -= 1;
        return;
      }

      state.currentMonth -= 1;
    },
    goToNextMonth: (state) => {
      if (state.currentMonth === 12) {
        state.currentMonth = 1;
        state.currentYear += 1;
        return;
      }

      state.currentMonth += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events || [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.event) {
          state.events.push(action.payload.event);
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter((event) => event._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentMonth,
  setCurrentYear,
  goToPrevMonth,
  goToNextMonth,
} = calendarSlice.actions;

export const selectCalendarEvents = (state) => state.calendar.events;
export const selectCalendarLoading = (state) => state.calendar.loading;
export const selectCalendarError = (state) => state.calendar.error;
export const selectCurrentMonth = (state) => state.calendar.currentMonth;
export const selectCurrentYear = (state) => state.calendar.currentYear;

export default calendarSlice.reducer;
