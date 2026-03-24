import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saSchoolsApi } from './saSchoolsApi.js';
import toast from 'react-hot-toast';

const initialState = {
  items: [],
  selectedItem: null,
  stats: null,
  loading: false,
  actionLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }
};

export const fetchDashboardStats = createAsyncThunk(
  'saSchools/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await saSchoolsApi.getDashboardStats();
      return response.data; // response.data is { stats: {...} } or the stats object itself
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchSchools = createAsyncThunk(
  'saSchools/fetchSchools',
  async (params, { rejectWithValue }) => {
    try {
      const response = await saSchoolsApi.getSchools(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch schools');
    }
  }
);

export const fetchSchoolById = createAsyncThunk(
  'saSchools/fetchSchoolById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await saSchoolsApi.getSchoolById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch school details');
    }
  }
);

export const createNewSchool = createAsyncThunk(
  'saSchools/createNewSchool',
  async (data, { rejectWithValue }) => {
    try {
      const response = await saSchoolsApi.createSchool(data);
      toast.success(response.message || 'School created successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create school');
      return rejectWithValue(err.response?.data?.message || 'Failed to create school');
    }
  }
);

export const toggleSchoolStatus = createAsyncThunk(
  'saSchools/toggleSchoolStatus',
  async ({ id, targetStatus }, { rejectWithValue }) => {
    try {
      let response;
      if (targetStatus === 'suspended') {
        response = await saSchoolsApi.suspendSchool(id);
      } else {
        response = await saSchoolsApi.reactivateSchool(id);
      }
      toast.success(response.message || `School ${targetStatus} successfully`);
      return { id, school: response.data, targetStatus };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change school status');
      return rejectWithValue(err.response?.data?.message || 'Failed to change school status');
    }
  }
);

const saSchoolsSlice = createSlice({
  name: 'saSchools',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchDashboardStats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload; // Usually backend sends data returning object here.
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchSchools
      .addCase(fetchSchools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || action.payload; // Safely assign array if it's wrapped.
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchSchoolById
      .addCase(fetchSchoolById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchoolById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchSchoolById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createNewSchool
      .addCase(createNewSchool.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createNewSchool.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Optionally prepend: state.items.unshift(action.payload);
      })
      .addCase(createNewSchool.rejected, (state) => {
        state.actionLoading = false;
      })
      // toggleSchoolStatus
      .addCase(toggleSchoolStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(toggleSchoolStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const nextStatus = action.payload.targetStatus;
        const nextIsActive = nextStatus === 'active';

        if (state.selectedItem && state.selectedItem._id === action.payload.id) {
          state.selectedItem.status = nextStatus;
          state.selectedItem.isActive = nextIsActive;
        }
        const index = state.items.findIndex(s => s._id === action.payload.id);
        if (index !== -1) {
          state.items[index].status = nextStatus;
          state.items[index].isActive = nextIsActive;
        }
      })
      .addCase(toggleSchoolStatus.rejected, (state) => {
        state.actionLoading = false;
      });
  }
});

export default saSchoolsSlice.reducer;
