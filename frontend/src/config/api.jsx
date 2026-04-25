export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const buildApiUrl = (path) => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};