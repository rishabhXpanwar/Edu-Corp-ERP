import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    globalLoading: false,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setSidebarCollapsed: (state, action) => { state.sidebarCollapsed = action.payload; },
    setGlobalLoading: (state, action) => { state.globalLoading = action.payload; },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;