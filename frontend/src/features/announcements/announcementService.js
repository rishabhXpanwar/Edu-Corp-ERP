import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';

export const fetchAnnouncements = async ({ page = 1, limit = 20, audience } = {}) => {
  console.log('[API] fetchAnnouncements called');

  const response = await axiosInstance.get(ENDPOINTS.ANNOUNCEMENTS, {
    params: {
      page,
      limit,
      ...(audience ? { audience } : {}),
    },
  });

  return response.data.data;
};

export const createAnnouncement = async (data) => {
  console.log('[API] createAnnouncement called');

  const response = await axiosInstance.post(ENDPOINTS.ANNOUNCEMENTS, {
    title: data.title,
    body: data.body,
    audience: data.audience,
  });

  return response.data.data;
};

export const deleteAnnouncement = async (id) => {
  console.log('[API] deleteAnnouncement called', id);

  const response = await axiosInstance.delete(ENDPOINTS.ANNOUNCEMENT_BY_ID(id));
  return response.data.data;
};
