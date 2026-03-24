import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';

const toTrimmedString = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
};

const buildParams = (params = {}) => {
  const cleaned = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value === 'string') {
      const trimmed = toTrimmedString(value);
      if (!trimmed) {
        return;
      }
      cleaned[key] = trimmed;
      return;
    }

    cleaned[key] = value;
  });

  return cleaned;
};

export const fetchAuditLogs = async (params = {}) => {
  console.log('[API] fetchAuditLogs called', params);

  const response = await axiosInstance.get(ENDPOINTS.AUDIT, {
    params: buildParams(params),
  });

  return response.data.data;
};
