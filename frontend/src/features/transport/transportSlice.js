import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';

// Fetch all transport routes
export const fetchTransports = createAsyncThunk(
  'transport/fetchTransports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TRANSPORT);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch transport routes';
      return rejectWithValue(message);
    }
  }
);

// Fetch a single transport route by ID
export const fetchTransport = createAsyncThunk(
  'transport/fetchTransport',
  async (transportId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TRANSPORT_BY_ID(transportId));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch transport route';
      return rejectWithValue(message);
    }
  }
);

// Create a new transport route
export const createTransport = createAsyncThunk(
  'transport/createTransport',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.TRANSPORT, payload);
      toast.success(response.data.message || 'Route created successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create route';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update a transport route
export const updateTransport = createAsyncThunk(
  'transport/updateTransport',
  async ({ transportId, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(ENDPOINTS.TRANSPORT_BY_ID(transportId), payload);
      toast.success(response.data.message || 'Route updated successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update route';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete a transport route
export const deleteTransport = createAsyncThunk(
  'transport/deleteTransport',
  async (transportId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.TRANSPORT_BY_ID(transportId));
      toast.success(response.data.message || 'Route deleted successfully');
      return { transportId };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete route';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Assign a student to a transport route
export const assignStudent = createAsyncThunk(
  'transport/assignStudent',
  async ({ transportId, studentId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.TRANSPORT_ASSIGN(transportId), { studentId });
      toast.success(response.data.message || 'Student assigned successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to assign student';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Unassign a student from a transport route
export const unassignStudent = createAsyncThunk(
  'transport/unassignStudent',
  async ({ transportId, studentId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.TRANSPORT_UNASSIGN(transportId), { studentId });
      toast.success(response.data.message || 'Student unassigned successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to unassign student';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

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

const transportSlice = createSlice({
  name: 'transport',
  initialState,
  reducers: {
    clearTransportError: (state) => {
      state.error = null;
    },
    clearSelectedTransport: (state) => {
      state.selectedItem = null;
    },
    setSelectedTransport: (state, action) => {
      state.selectedItem = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTransports
      .addCase(fetchTransports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransports.fulfilled, (state, action) => {
        state.loading = false;
        const transports = action.payload.transports || [];
        state.items = transports;
        state.pagination = {
          page: 1,
          limit: transports.length || 20,
          total: transports.length,
          totalPages: transports.length > 0 ? 1 : 0,
        };
      })
      .addCase(fetchTransports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchTransport
      .addCase(fetchTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransport.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload.transport || null;
      })
      .addCase(fetchTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createTransport
      .addCase(createTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransport.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.transport) {
          state.items.unshift(action.payload.transport);
          state.pagination.total += 1;
          state.pagination.totalPages = 1;
        }
      })
      .addCase(createTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateTransport
      .addCase(updateTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransport.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTransport = action.payload.transport;
        if (updatedTransport) {
          const index = state.items.findIndex((item) => item._id === updatedTransport._id);
          if (index !== -1) {
            state.items[index] = updatedTransport;
          }
          if (state.selectedItem?._id === updatedTransport._id) {
            state.selectedItem = updatedTransport;
          }
        }
      })
      .addCase(updateTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteTransport
      .addCase(deleteTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransport.fulfilled, (state, action) => {
        state.loading = false;
        const { transportId } = action.payload;
        state.items = state.items.filter((item) => item._id !== transportId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        state.pagination.totalPages = state.pagination.total > 0 ? 1 : 0;
        if (state.selectedItem?._id === transportId) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // assignStudent
      .addCase(assignStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignStudent.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTransport = action.payload.transport;
        if (updatedTransport) {
          const index = state.items.findIndex((item) => item._id === updatedTransport._id);
          if (index !== -1) {
            state.items[index] = updatedTransport;
          }
          if (state.selectedItem?._id === updatedTransport._id) {
            state.selectedItem = updatedTransport;
          }
        }
      })
      .addCase(assignStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // unassignStudent
      .addCase(unassignStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unassignStudent.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTransport = action.payload.transport;
        if (updatedTransport) {
          const index = state.items.findIndex((item) => item._id === updatedTransport._id);
          if (index !== -1) {
            state.items[index] = updatedTransport;
          }
          if (state.selectedItem?._id === updatedTransport._id) {
            state.selectedItem = updatedTransport;
          }
        }
      })
      .addCase(unassignStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTransportError, clearSelectedTransport, setSelectedTransport } = transportSlice.actions;

export default transportSlice.reducer;
