import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';

export const getSettings = async () => {
  console.log('[API] getSettings called');

  const response = await axiosInstance.get(ENDPOINTS.SETTINGS);
  return response.data.data;
};

export const updateSettings = async (formData) => {
  console.log('[API] updateSettings called');

  const response = await axiosInstance.put(ENDPOINTS.SETTINGS, formData);
  return response.data.data;
};
