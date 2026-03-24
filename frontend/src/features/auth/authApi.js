import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';

export const loginWithEmail = async ({ email, password }) => {
  const response = await axiosInstance.post(ENDPOINTS.AUTH_LOGIN_EMAIL, { email, password });
  return response.data;
};

export const sendOtp = async ({ phone }) => {
  const response = await axiosInstance.post(ENDPOINTS.AUTH_SEND_OTP, { phone });
  return response.data;
};

export const loginWithOtp = async ({ phone, otp }) => {
  const response = await axiosInstance.post(ENDPOINTS.AUTH_LOGIN_OTP, { phone, otp });
  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosInstance.post(ENDPOINTS.AUTH_LOGOUT);
  return response.data;
};

export const forgotPassword = async ({ email }) => {
  const response = await axiosInstance.post(ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
  return response.data;
};

export const resetPassword = async ({ token, newPassword }) => {
  const response = await axiosInstance.post(ENDPOINTS.AUTH_RESET_PASSWORD, { token, newPassword });
  return response.data;
};
