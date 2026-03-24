import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import * as settingsService from './settingsService.js';

const initialState = {
  school: null,
  currentYear: null,
  loading: false,
  updateLoading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsService.getSettings();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  },
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await settingsService.updateSettings(formData);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update settings';
      return rejectWithValue(message);
    }
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.school = action.payload.school || null;
        state.currentYear = action.payload.currentYear || null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSettings.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.school = action.payload.school || state.school;
        toast.success('Settings updated');
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to update settings');
      });
  },
});

export const selectSchool = (state) => state.settings.school;
export const selectCurrentYear = (state) => state.settings.currentYear;
export const selectSettingsLoading = (state) => state.settings.loading;
export const selectUpdateLoading = (state) => state.settings.updateLoading;
export const selectSettingsError = (state) => state.settings.error;

export default settingsSlice.reducer;
