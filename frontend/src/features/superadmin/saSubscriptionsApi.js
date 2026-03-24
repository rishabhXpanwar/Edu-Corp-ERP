import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';

export const saSubscriptionsApi = {
  getSubscriptions: async (params = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.SUBSCRIPTIONS, { params });
    return response.data;
  },

  getSubscriptionById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.SUBSCRIPTION_BY_ID(id));
    return response.data;
  },

  updatePlan: async (id, plan) => {
    const response = await axiosInstance.patch(ENDPOINTS.SUBSCRIPTION_PLAN(id), { plan });
    return response.data;
  },

  recordBilling: async (id, data) => {
    const response = await axiosInstance.post(ENDPOINTS.SUBSCRIPTION_BILLING(id), data);
    return response.data;
  }
};
