// API headers utility for development mode
const VITE_DEV_API_KEY = import.meta.env.VITE_DEV_API_KEY;

export const getApiHeaders = (additionalHeaders: Record<string, string> = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  // Add x-api-key header in development mode
  if (import.meta.env.DEV) {
    headers['x-api-key'] = VITE_DEV_API_KEY;
  }

  return headers;
};