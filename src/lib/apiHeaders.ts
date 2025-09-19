// API headers utility for development mode
const DEV_API_KEY = '46d1537e7251eb5d0c15891fb575f5bd24bc7df741aa1025ae4b1b8b18fe2678';

export const getApiHeaders = (additionalHeaders: Record<string, string> = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  // Add x-api-key header in development mode
  if (import.meta.env.DEV) {
    headers['x-api-key'] = DEV_API_KEY;
  }

  return headers;
};