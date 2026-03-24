import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { ENDPOINTS } from '../../services/endpoints';
import toast from 'react-hot-toast';

const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

export const fetchExams = createAsyncThunk(
  'exam/fetchExams',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.EXAMS, { params });
      return response.data.data.exams;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch exams');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchExamById = createAsyncThunk(
  'exam/fetchExamById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.EXAM_BY_ID(id));
      return response.data.data.exam;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch exam details');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createExam = createAsyncThunk(
  'exam/createExam',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.EXAMS, payload);
      toast.success(response.data.message || 'Exam created successfully');
      return response.data.data.exam;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create exam');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateExam = createAsyncThunk(
  'exam/updateExam',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(ENDPOINTS.EXAM_BY_ID(id), data);
      toast.success(response.data.message || 'Exam updated successfully');
      return response.data.data.exam;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update exam');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteExam = createAsyncThunk(
  'exam/deleteExam',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.EXAM_BY_ID(id));
      toast.success(response.data.message || 'Exam deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete exam');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchExams
      .addCase(fetchExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.items = action.payload; // Non-paginated response handling
          state.pagination = initialState.pagination;
        } else {
          state.items = action.payload.items || [];
          state.pagination = {
            page: action.payload.page || 1,
            limit: action.payload.limit || 20,
            total: action.payload.total || 0,
            totalPages: action.payload.totalPages || 0,
          };
        }
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchExamById
      .addCase(fetchExamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchExamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createExam
      .addCase(createExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateExam
      .addCase(updateExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?._id === action.payload._id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updateExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteExam
      .addCase(deleteExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
        if (state.selectedItem?._id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedItem, clearError } = examSlice.actions;

export default examSlice.reducer;
