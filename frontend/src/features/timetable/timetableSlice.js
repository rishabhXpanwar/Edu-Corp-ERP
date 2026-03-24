import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { ENDPOINTS } from '../../services/endpoints';
import toast from 'react-hot-toast';

export const fetchSectionTimetable = createAsyncThunk(
  'timetable/fetchSectionTimetable',
  async (sectionId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TIMETABLE_SECTION(sectionId));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch timetable');
    }
  }
);

export const fetchMyTimetable = createAsyncThunk(
  'timetable/fetchMyTimetable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TIMETABLE_ME);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your timetable');
    }
  }
);

export const updateSectionTimetable = createAsyncThunk(
  'timetable/updateSectionTimetable',
  async ({ sectionId, schedule }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(ENDPOINTS.TIMETABLE_SECTION(sectionId), { schedule });
      toast.success('Timetable updated successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update timetable');
      return rejectWithValue(error.response?.data?.message || 'Failed to update timetable');
    }
  }
);

const initialState = {
  schedule: null,
  loading: false,
  error: null,
};

const timetableSlice = createSlice({
  name: 'timetable',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSectionTimetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSectionTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.schedule = action.payload?.timetable?.schedule || action.payload?.schedule || [];
      })
      .addCase(fetchSectionTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyTimetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.schedule = action.payload?.timetable?.schedule || action.payload?.schedule || [];
      })
      .addCase(fetchMyTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSectionTimetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSectionTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.schedule = action.payload?.timetable?.schedule || action.payload?.schedule || [];
      })
      .addCase(updateSectionTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default timetableSlice.reducer;
