import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saSubscriptionsApi } from './saSubscriptionsApi.js';
import toast from 'react-hot-toast';

const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  actionLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }
};

export const fetchSubscriptions = createAsyncThunk(
  'saSubscriptions/fetchSubscriptions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await saSubscriptionsApi.getSubscriptions(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }
);

export const fetchSubscriptionById = createAsyncThunk(
  'saSubscriptions/fetchSubscriptionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await saSubscriptionsApi.getSubscriptionById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch subscription details');
    }
  }
);

export const updateSubscriptionPlan = createAsyncThunk(
  'saSubscriptions/updateSubscriptionPlan',
  async ({ id, plan }, { rejectWithValue }) => {
    try {
      const response = await saSubscriptionsApi.updatePlan(id, plan);
      toast.success(response.message || 'Subscription plan updated successfully');
      return { id, subscription: response.data };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update plan');
      return rejectWithValue(err.response?.data?.message || 'Failed to update plan');
    }
  }
);

export const recordSubscriptionBilling = createAsyncThunk(
  'saSubscriptions/recordSubscriptionBilling',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await saSubscriptionsApi.recordBilling(id, data);
      toast.success(response.message || 'Payment recorded successfully');
      return { id, subscription: response.data };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
      return rejectWithValue(err.response?.data?.message || 'Failed to record payment');
    }
  }
);

const saSubscriptionsSlice = createSlice({
  name: 'saSubscriptions',
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchSubscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchSubscriptionById
      .addCase(fetchSubscriptionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchSubscriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateSubscriptionPlan
      .addCase(updateSubscriptionPlan.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateSubscriptionPlan.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.selectedItem && state.selectedItem._id === action.payload.id) {
          state.selectedItem.plan = action.payload.subscription.plan;
        }
        const index = state.items.findIndex((s) => s._id === action.payload.id);
        if (index !== -1) {
          state.items[index].plan = action.payload.subscription.plan;
        }
      })
      .addCase(updateSubscriptionPlan.rejected, (state) => {
        state.actionLoading = false;
      })
      // recordSubscriptionBilling
      .addCase(recordSubscriptionBilling.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(recordSubscriptionBilling.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.selectedItem && state.selectedItem._id === action.payload.id) {
          state.selectedItem.billing = action.payload.subscription.billing;
        }
      })
      .addCase(recordSubscriptionBilling.rejected, (state) => {
        state.actionLoading = false;
      });
  }
});

export const { clearSelectedItem } = saSubscriptionsSlice.actions;
export default saSubscriptionsSlice.reducer;
