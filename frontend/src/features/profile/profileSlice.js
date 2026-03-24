import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';
import toast from 'react-hot-toast';

const initialState = {
  profile: null,
  loading: false,
  error: null,
  updateLoading: false,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PROFILE);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      // If we support file upload, it should ideally be FormData. For now, assuming standard JSON payload,
      // as backend allows profilePicture URL or other data. Wait, instruction says "avatar upload".
      // If FormData is needed, axios can take FormData directly.
      const isFormData = profileData instanceof FormData;
      const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
      const response = await axiosInstance.put(ENDPOINTS.UPDATE_PROFILE, profileData, { headers });
      toast.success(response.message || 'Profile updated successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const updatePassword = createAsyncThunk(
  'profile/updatePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(ENDPOINTS.UPDATE_PASSWORD, passwordData);
      toast.success(response.message || 'Password updated successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
      return rejectWithValue(err.response?.data?.message || 'Failed to update password');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Assume API returns { success: true, message: ..., data: profileObject }
        // Our api slice usually handles returning response.data in thunk, so action.payload is the innermost object or wrapper depending on backend.
        // Usually action.payload is { data: profileObject, ... } based on earlier slices or sometimes just the object if interceptor strips it.
        // Looking at BE conventions, response is { success: true, data: { user } }
        state.profile = action.payload.data || action.payload.user || action.payload; 
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.profile = action.payload.data || action.payload.user || action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
      })
      // updatePassword
      .addCase(updatePassword.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.updateLoading = false;
        // we might also want to set user.mustChangePassword = false in authSlice
        // but that's managed globally if we refresh token or by the next refresh.
      })
      .addCase(updatePassword.rejected, (state) => {
        state.updateLoading = false;
      });
  }
});

export const selectProfile = (state) => state.profile.profile;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileUpdateLoading = (state) => state.profile.updateLoading;

export default profileSlice.reducer;
