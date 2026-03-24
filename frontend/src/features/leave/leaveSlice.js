import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';

export const applyLeave = createAsyncThunk(
  'leave/applyLeave',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.LEAVE, payload);
      toast.success(response.data.message || 'Leave request submitted');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to apply for leave';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchMyLeaveHistory = createAsyncThunk(
  'leave/fetchMyLeaveHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.LEAVE_MY, { params });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch leave history';
      return rejectWithValue(message);
    }
  }
);

export const fetchLeaveQueue = createAsyncThunk(
  'leave/fetchLeaveQueue',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.LEAVE_QUEUE, { params });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch leave queue';
      return rejectWithValue(message);
    }
  }
);

export const reviewLeave = createAsyncThunk(
  'leave/reviewLeave',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.LEAVE_REVIEW(id), payload);
      toast.success(response.data.message || 'Leave request reviewed');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to review leave request';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  myRequests: [],
  queue: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    clearLeaveError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.leaveRequest) {
          state.myRequests.unshift(action.payload.leaveRequest);
        }
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMyLeaveHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyLeaveHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests = action.payload.items || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchMyLeaveHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchLeaveQueue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.queue = action.payload.items || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchLeaveQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(reviewLeave.fulfilled, (state, action) => {
        const updatedRequest = action.payload.leaveRequest;
        if (!updatedRequest) {
          return;
        }

        const queueIndex = state.queue.findIndex((item) => item._id === updatedRequest._id);
        if (queueIndex !== -1) {
          state.queue.splice(queueIndex, 1);
        }

        const myIndex = state.myRequests.findIndex((item) => item._id === updatedRequest._id);
        if (myIndex !== -1) {
          state.myRequests[myIndex] = updatedRequest;
        }
      })
      .addCase(reviewLeave.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearLeaveError } = leaveSlice.actions;

export default leaveSlice.reducer;
