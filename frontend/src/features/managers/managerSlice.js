import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';
import toast from 'react-hot-toast';

export const fetchManagers = createAsyncThunk(
  'managers/fetchManagers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20, search } = params;
      const queryParams = new URLSearchParams({ page, limit });
      if (search) queryParams.append('search', search);

      const response = await axiosInstance.get(`${ENDPOINTS.MANAGERS}?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch managers' });
    }
  }
);

export const createManager = createAsyncThunk(
  'managers/createManager',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.MANAGERS, data);
      toast.success('Manager created successfully');
      return response.data.data?.manager || response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      toast.error(error.response?.data?.message || 'Failed to create manager');
      return rejectWithValue(error.response?.data || { message: 'Failed to create manager' });
    }
  }
);

export const updateManagerStatus = createAsyncThunk(
  'managers/updateManagerStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.USER_STATUS(id), { isActive });
      toast.success(isActive ? 'Manager activated successfully' : 'Manager deactivated successfully');
      return { id, isActive, data: response.data.data };
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to update manager status' });
    }
  }
);

const initialState = {
  managers: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
};

const managerSlice = createSlice({
  name: 'managers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchManagers
      .addCase(fetchManagers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchManagers.fulfilled, (state, action) => {
        state.loading = false;
        state.managers = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchManagers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // createManager
      .addCase(createManager.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          state.managers.unshift(action.payload);
        }
      })
      
      // updateManagerStatus
      .addCase(updateManagerStatus.fulfilled, (state, action) => {
        const { id, isActive } = action.payload;
        const manager = state.managers.find(m => m._id === id);
        if (manager) {
          manager.isActive = isActive;
        }
      });
  }
});

export default managerSlice.reducer;
