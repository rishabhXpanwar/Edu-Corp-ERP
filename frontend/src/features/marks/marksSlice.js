import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { ENDPOINTS } from '../../services/endpoints';
import toast from 'react-hot-toast';

export const fetchSectionMarks = createAsyncThunk(
  'marks/fetchSectionMarks',
  async ({ examId, sectionId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.MARKS_EXAM_SECTION(examId, sectionId));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch marks');
    }
  }
);

export const saveMarks = createAsyncThunk(
  'marks/saveMarks',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.MARKS, payload);
      toast.success('Marks saved successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save marks');
      return rejectWithValue(error.response?.data?.message || 'Failed to save marks');
    }
  }
);

export const publishSectionMarks = createAsyncThunk(
  'marks/publishSectionMarks',
  async ({ examId, sectionId }, { rejectWithValue }) => {
    try {
      await axiosInstance.patch(ENDPOINTS.MARKS_PUBLISH(examId, sectionId));
      toast.success('Marks published successfully');
      return { examId, sectionId };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish marks');
      return rejectWithValue(error.response?.data?.message || 'Failed to publish marks');
    }
  }
);

const initialState = {
  sectionMarks: [], // array of marks per student
  loading: false,
  error: null,
  saveLoading: false,
};

const marksSlice = createSlice({
  name: 'marks',
  initialState,
  reducers: {
    clearMarksData(state) {
      state.sectionMarks = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchSectionMarks
      .addCase(fetchSectionMarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSectionMarks.fulfilled, (state, action) => {
        state.loading = false;
        state.sectionMarks = action.payload.marks || [];
      })
      .addCase(fetchSectionMarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // saveMarks
      .addCase(saveMarks.pending, (state) => {
        state.saveLoading = true;
        state.error = null;
      })
      .addCase(saveMarks.fulfilled, (state, action) => {
        state.saveLoading = false;
        // Re-fetch handled by component
      })
      .addCase(saveMarks.rejected, (state, action) => {
        state.saveLoading = false;
        state.error = action.payload;
      })
      // publishSectionMarks
      .addCase(publishSectionMarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishSectionMarks.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(publishSectionMarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMarksData } = marksSlice.actions;
export default marksSlice.reducer;
