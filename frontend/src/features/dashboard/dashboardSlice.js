import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {},
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboardLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDashboardError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setDashboardLoading, setDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
