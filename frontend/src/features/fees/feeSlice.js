import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { ENDPOINTS } from '../../services/endpoints';
import toast from 'react-hot-toast';

export const fetchFees = createAsyncThunk(
  'fee/fetchFees',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.FEES, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch fees'
      );
    }
  }
);

export const fetchStudentFees = createAsyncThunk(
  'fee/fetchStudentFees',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.FEES_STUDENT(studentId));
      return response.data.data; // expects array of fees
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch student fees'
      );
    }
  }
);

export const createFee = createAsyncThunk(
  'fee/createFee',
  async (feeData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.FEES, feeData);
      toast.success(response.data.message || 'Fee created successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create fee');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create fee'
      );
    }
  }
);

export const markFeePaid = createAsyncThunk(
  'fee/markFeePaid',
  async (feeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.FEE_PAID(feeId));
      toast.success(response.data.message || 'Fee marked as paid');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update fee status');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update fee status'
      );
    }
  }
);

export const markFeeUnpaid = createAsyncThunk(
  'fee/markFeeUnpaid',
  async (feeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.FEE_UNPAID(feeId));
      toast.success(response.data.message || 'Fee marked as unpaid');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update fee status');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update fee status'
      );
    }
  }
);

const initialState = {
  items: [],
  studentFees: [],
  stats: { collected: 0, outstanding: 0 },
  loading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
};

const feeSlice = createSlice({
  name: 'fee',
  initialState,
  reducers: {
    clearStudentFees: (state) => {
      state.studentFees = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchFees
      .addCase(fetchFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFees.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        
        // Calculate basic stats from current page since backend doesn't provide them
        const collected = (action.payload.items || []).filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
        const outstanding = (action.payload.items || []).filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);
        state.stats = { collected, outstanding };
        
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0
        };
      })
      .addCase(fetchFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchStudentFees
      .addCase(fetchStudentFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentFees.fulfilled, (state, action) => {
        state.loading = false;
        state.studentFees = action.payload.fees || [];
      })
      .addCase(fetchStudentFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createFee
      .addCase(createFee.fulfilled, (state, action) => {
        if (action.payload.fee) {
          state.items.unshift(action.payload.fee);
          if (state.stats) {
             state.stats.outstanding += action.payload.fee.amount || 0;
          }
        }
      })

      // markFeePaid
      .addCase(markFeePaid.fulfilled, (state, action) => {
        const updatedFee = action.payload.fee || action.payload;
        // update in items
        const index = state.items.findIndex((f) => f._id === updatedFee._id);
        if (index !== -1) {
          state.items[index] = updatedFee;
        }
        // update in studentFees
        const sIndex = state.studentFees.findIndex((f) => f._id === updatedFee._id);
        if (sIndex !== -1) {
          state.studentFees[sIndex] = updatedFee;
        }
        // approximate stats update could be done here, or rely on refetch from component
      })

      // markFeeUnpaid
      .addCase(markFeeUnpaid.fulfilled, (state, action) => {
        const updatedFee = action.payload.fee || action.payload;
        // update in items
        const index = state.items.findIndex((f) => f._id === updatedFee._id);
        if (index !== -1) {
          state.items[index] = updatedFee;
        }
        // update in studentFees
        const sIndex = state.studentFees.findIndex((f) => f._id === updatedFee._id);
        if (sIndex !== -1) {
          state.studentFees[sIndex] = updatedFee;
        }
      });
  },
});

export const { clearStudentFees } = feeSlice.actions;
export default feeSlice.reducer;
