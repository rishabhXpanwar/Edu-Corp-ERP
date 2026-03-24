import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';
import toast from 'react-hot-toast';

export const fetchSectionAttendance = createAsyncThunk(
  'attendance/fetchSectionAttendance',
  async ({ sectionId, date }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${ENDPOINTS.ATTENDANCE_SECTION(sectionId)}?date=${date}`);
      return response.data.data; // this should return the attendance record for that date
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch attendance' });
    }
  }
);

export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.ATTENDANCE, data);
      toast.success('Attendance saved successfully');
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      toast.error(error.response?.data?.message || 'Failed to save attendance');
      return rejectWithValue(error.response?.data || { message: 'Failed to save attendance' });
    }
  }
);

export const fetchAttendanceReport = createAsyncThunk(
  'attendance/fetchAttendanceReport',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await axiosInstance.get(`${ENDPOINTS.ATTENDANCE_REPORT}?${queryParams.toString()}`);
      return response.data.data; // Returns report list
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch attendance report' });
    }
  }
);

const initialState = {
  records: [], // Current day's records
  report: [], // Aggregated report data
  loading: false,
  saving: false,
  error: null
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
    resetRecords: (state) => {
      state.records = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchSectionAttendance
      .addCase(fetchSectionAttendance.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSectionAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload; // Set records
      })
      .addCase(fetchSectionAttendance.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
        state.records = [];
      })
      
      // markAttendance
      .addCase(markAttendance.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.saving = false;
        state.records = action.payload; 
      })
      .addCase(markAttendance.rejected, (state, action) => { 
        state.saving = false; 
        state.error = action.payload; 
      })

      // fetchAttendanceReport
      .addCase(fetchAttendanceReport.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAttendanceReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchAttendanceReport.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { clearAttendanceError, resetRecords } = attendanceSlice.actions;
export default attendanceSlice.reducer;
