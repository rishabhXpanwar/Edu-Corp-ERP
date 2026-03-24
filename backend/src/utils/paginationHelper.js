import { PAGINATION_DEFAULT_LIMIT } from '../config/constants.js';

export const getPagination = (query) => {
  const page  = Math.max(1, parseInt(query.page, 10)  || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || PAGINATION_DEFAULT_LIMIT);
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};