import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';

export const fetchEvents = async ({ month, year }) => {
  console.log('[API] fetchEvents called', { month, year });

  const response = await axiosInstance.get(ENDPOINTS.CALENDAR, {
    params: { month, year },
  });

  return response.data.data;
};

export const createEvent = async (data) => {
  console.log('[API] createEvent called', data);

  const response = await axiosInstance.post(ENDPOINTS.CALENDAR, data);
  return response.data.data;
};

export const deleteEvent = async (id) => {
  console.log('[API] deleteEvent called', id);

  const response = await axiosInstance.delete(ENDPOINTS.CALENDAR_BY_ID(id));
  return response.data.data;
};
