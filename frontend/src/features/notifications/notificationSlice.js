import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import * as notificationApi from './notificationService.js';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const data = await notificationApi.fetchNotifications({ page, limit });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },
);

export const sendNotification = createAsyncThunk(
  'notification/sendNotification',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await notificationApi.sendNotification(payload);
      toast.success('Notification sent');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send notification';
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const markNotificationsRead = createAsyncThunk(
  'notification/markNotificationsRead',
  async (notificationIds, { rejectWithValue }) => {
    try {
      const data = await notificationApi.markNotificationsRead(notificationIds);
      return {
        notificationIds,
        modifiedCount: data.modifiedCount || 0,
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark notifications as read';
      return rejectWithValue(message);
    }
  },
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationApi.fetchUnreadCount();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  },
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const incoming = action.payload || {};
      const notificationId = incoming._id || incoming.notificationId;

      if (!notificationId) {
        return;
      }

      const alreadyExists = state.notifications.some(
        (item) => (item._id || item.notificationId) === notificationId,
      );

      if (alreadyExists) {
        return;
      }

      state.notifications.unshift({
        ...incoming,
        _id: notificationId,
        isRead: incoming.isRead ?? false,
      });
      state.pagination.total += 1;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    clearNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.items || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(sendNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendNotification.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(markNotificationsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationsRead.fulfilled, (state, action) => {
        state.loading = false;

        const ids = new Set(action.payload.notificationIds);
        let changedCount = 0;

        state.notifications = state.notifications.map((notification) => {
          if (ids.has(notification._id) && !notification.isRead) {
            changedCount += 1;
            return {
              ...notification,
              isRead: true,
              readAt: new Date().toISOString(),
            };
          }

          return notification;
        });

        state.unreadCount = Math.max(0, state.unreadCount - changedCount);
      })
      .addCase(markNotificationsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unreadCount || 0;
      });
  },
});

export const {
  addNotification,
  incrementUnreadCount,
  clearNotificationError,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notification.notifications;
export const selectUnreadCount = (state) => state.notification.unreadCount;
export const selectNotifLoading = (state) => state.notification.loading;
export const selectNotifError = (state) => state.notification.error;
export const selectNotifPagination = (state) => state.notification.pagination;

export default notificationSlice.reducer;
