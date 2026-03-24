import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';
import toast from 'react-hot-toast';

export const fetchAssignments = createAsyncThunk(
  'assignment/fetchAssignments',
  async (sectionId, { rejectWithValue }) => {
    try {
      if (!sectionId) return [];
      const response = await axiosInstance.get(ENDPOINTS.ASSIGNMENTS_SECTION(sectionId));
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch assignments' });
    }
  }
);

export const createAssignment = createAsyncThunk(
  'assignment/createAssignment',
  async (assignmentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.ASSIGNMENTS, assignmentData);
      toast.success('Assignment created successfully');
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to create assignment' });
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  'assignment/deleteAssignment',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(ENDPOINTS.ASSIGNMENT_BY_ID(id));
      toast.success('Assignment deleted successfully');
      return id;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to delete assignment' });
    }
  }
);

const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null
};

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAssignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createAssignment
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload); // Add to beginning of array
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteAssignment
      .addCase(deleteAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = assignmentSlice.actions;

export default assignmentSlice.reducer;
