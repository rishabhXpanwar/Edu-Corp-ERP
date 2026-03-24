import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from './authApi.js';
import { ACCESS_TOKEN_KEY } from '../../constants/appConfig.js';
import toast from 'react-hot-toast';

const readStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

const removeStoredToken = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    // noop
  }
};

const decodeTokenPayload = (token) => {
  if (!token) {
    return null;
  }

  try {
    const [, payloadSegment] = token.split('.');
    if (!payloadSegment) {
      return null;
    }

    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(padded));

    if (decoded?.exp && decoded.exp * 1000 <= Date.now()) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

const mapTokenPayloadToUser = (payload) => {
  if (!payload) {
    return null;
  }

  const userId = payload._id || payload.id || payload.userId || null;

  return {
    _id: userId,
    userId,
    id: userId,
    name: payload.name || '',
    email: payload.email || '',
    role: payload.role || null,
    schoolId: payload.schoolId ?? null,
  };
};

const getHydratedAuth = () => {
  const token = readStoredToken();
  const payload = decodeTokenPayload(token);

  if (!payload) {
    if (token) {
      removeStoredToken();
    }

    return {
      user: null,
      isAuthenticated: false,
    };
  }

  return {
    user: mapTokenPayloadToUser(payload),
    isAuthenticated: true,
  };
};

export const loginEmail = createAsyncThunk(
  'auth/loginEmail',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.loginWithEmail(credentials);
      localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
      toast.success(response.message || 'Login successful');
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const sendOtpToken = createAsyncThunk(
  'auth/sendOtpToken',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.sendOtp(payload);
      toast.success(response.message || 'OTP sent successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const loginOtp = createAsyncThunk(
  'auth/loginOtp',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.loginWithOtp(credentials);
      localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
      toast.success(response.message || 'Login successful');
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'OTP Login failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logoutUser();
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      return null;
    } catch (error) {
      localStorage.removeItem(ACCESS_TOKEN_KEY); 
      return rejectWithValue(error.response?.data?.message || 'Logout error');
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(payload);
      toast.success(response.message || 'Reset link sent');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(payload);
      toast.success(response.message || 'Password reset successful');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const hydratedAuth = getHydratedAuth();

const initialState = {
  user: hydratedAuth.user,
  isAuthenticated: hydratedAuth.isAuthenticated,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Email Login
      .addCase(loginEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // OTP Login
      .addCase(loginOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // Forgot / Reset passing loading states
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
