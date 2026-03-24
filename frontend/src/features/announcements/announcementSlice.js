import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import * as announcementApi from './announcementService.js';

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

export const fetchAnnouncements = createAsyncThunk(
  'announcement/fetchAnnouncements',
  async ({ page = 1, limit = 20, audience } = {}, { rejectWithValue }) => {
    try {
      const data = await announcementApi.fetchAnnouncements({ page, limit, audience });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch announcements');
    }
  },
);

export const createAnnouncement = createAsyncThunk(
  'announcement/createAnnouncement',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await announcementApi.createAnnouncement(payload);
      toast.success('Announcement posted');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create announcement';
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const deleteAnnouncement = createAsyncThunk(
  'announcement/deleteAnnouncement',
  async (id, { rejectWithValue }) => {
    try {
      await announcementApi.deleteAnnouncement(id);
      toast.success('Deleted');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete announcement';
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const announcementSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    clearAnnouncementError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.announcement) {
          state.items.unshift(action.payload.announcement);
          state.pagination.total += 1;
        }
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnnouncementError } = announcementSlice.actions;

export const selectAnnouncements = (state) => state.announcement.items;
export const selectAnnouncementLoading = (state) => state.announcement.loading;
export const selectAnnouncementError = (state) => state.announcement.error;
export const selectAnnouncementPagination = (state) => state.announcement.pagination;

export default announcementSlice.reducer;
