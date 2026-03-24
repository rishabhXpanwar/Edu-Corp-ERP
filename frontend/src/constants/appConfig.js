export const ACCESS_TOKEN_KEY = 'educore_access_token';
export const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '')
  : 'http://localhost:5000';
export const APP_NAME = 'EduCore ERP';
export const PAGINATION_DEFAULT_LIMIT = 20;