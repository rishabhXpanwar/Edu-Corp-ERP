import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';

export const saSchoolsApi = {
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/schools/dashboard/stats');
    return response.data;
  },

  getSchools: async (params = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.SCHOOLS, { params });
    return response.data;
  },

  getSchoolById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.SCHOOL_BY_ID(id));
    return response.data;
  },

  createSchool: async (data) => {
    const response = await axiosInstance.post(ENDPOINTS.SCHOOLS, data);
    return response.data;
  },

  suspendSchool: async (id) => {
    const response = await axiosInstance.patch(ENDPOINTS.SCHOOL_SUSPEND(id));
    return response.data;
  },

  reactivateSchool: async (id) => {
    const response = await axiosInstance.patch(ENDPOINTS.SCHOOL_REACTIVATE(id));
    return response.data;
  }
};
