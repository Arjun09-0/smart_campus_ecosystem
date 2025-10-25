// API configuration for different environments
const API_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path) => {
  // In development with proxy, use relative paths
  if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
    return path;
  }
  // In production, use full URL
  return `${API_URL}${path}`;
};

export default { getApiUrl };
