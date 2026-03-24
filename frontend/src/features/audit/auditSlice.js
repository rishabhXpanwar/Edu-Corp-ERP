import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as auditApi from './auditService.js';

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

export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchAuditLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await auditApi.fetchAuditLogs(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch audit logs');
    }
  },
);

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    clearAuditError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuditError } = auditSlice.actions;

export const selectAuditLogs = (state) => state.audit.items;
export const selectAuditLoading = (state) => state.audit.loading;
export const selectAuditError = (state) => state.audit.error;
export const selectAuditPagination = (state) => state.audit.pagination;

export default auditSlice.reducer;
