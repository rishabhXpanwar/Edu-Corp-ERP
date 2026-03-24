import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';

export const fetchNotifications = async ({ page = 1, limit = 20 } = {}) => {
  console.log('[API] fetchNotifications called');

  const response = await axiosInstance.get(ENDPOINTS.NOTIFICATIONS, {
    params: { page, limit },
  });

  return response.data.data;
};

export const sendNotification = async (data) => {
  console.log('[API] sendNotification called', data);

  const payload = {
    type: data.type,
    message: data.message,
  };

  if (data.recipientId) {
    payload.recipientId = data.recipientId;
  }

  if (data.sectionId) {
    payload.sectionId = data.sectionId;
  }

  if (data.classId) {
    payload.classId = data.classId;
  }

  const response = await axiosInstance.post(ENDPOINTS.NOTIFICATIONS, payload);
  return response.data.data;
};

export const markNotificationsRead = async (notificationIds) => {
  console.log('[API] markNotificationsRead called');

  const response = await axiosInstance.patch(ENDPOINTS.NOTIFICATIONS_READ, {
    notificationIds,
  });

  return response.data.data;
};

export const fetchUnreadCount = async () => {
  console.log('[API] fetchUnreadCount called');

  const response = await axiosInstance.get(ENDPOINTS.NOTIFICATIONS_UNREAD);
  return response.data.data;
};
