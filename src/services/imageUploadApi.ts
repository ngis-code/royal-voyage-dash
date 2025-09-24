// Image upload service for handling file uploads
const UPLOAD_SERVER_URL = import.meta.env.VITE_UPLOAD_SERVER_URL;
const UPLOAD_TOKEN = import.meta.env.VITE_UPLOAD_TOKEN;
const STATIC_SERVER_URL = import.meta.env.VITE_STATIC_SERVER_URL;

export interface UploadResponse {
  message: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${UPLOAD_SERVER_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UPLOAD_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
};

export const updateImage = async (filename: string, file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${UPLOAD_SERVER_URL}/file/${filename}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${UPLOAD_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Update failed: ${response.statusText}`);
  }

  return response.json();
};

export const deleteImage = async (filename: string): Promise<void> => {
  const response = await fetch(`${UPLOAD_SERVER_URL}/file/${filename}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${UPLOAD_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.statusText}`);
  }
};

export const deleteVideo = async (filename: string): Promise<void> => {
  const response = await fetch(`${UPLOAD_SERVER_URL}/video/${filename}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${UPLOAD_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Delete video failed: ${response.statusText}`);
  }
};

export const deleteHlsVideo = async (filename: string): Promise<void> => {
  const response = await fetch(`${UPLOAD_SERVER_URL}/hls/${filename}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${UPLOAD_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Delete HLS video failed: ${response.statusText}`);
  }
};

export const uploadVideo = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${UPLOAD_SERVER_URL}/upload/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UPLOAD_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Video upload failed: ${response.statusText}`);
  }

  return response.json();
};

export const getImageUrl = (filename: string): string => {
  return `${STATIC_SERVER_URL}/${filename}`;
};

export const getVideoUrl = (filename: string): string => {
  return `${STATIC_SERVER_URL}/videos/${filename}`;
};

export const getHlsUrl = (filename: string): string => {
  return `${STATIC_SERVER_URL}/${filename}`;
};

export interface VideoConversionResponse {
  status: number;
  payload: {
    _id: string;
    originalUrl: string;
    videoVersions: Array<{
      format: string;
      quality: string;
      segmentCount: number;
      path: string;
      size: number;
      actualSegmentCount: number;
    }>;
  };
}

export const convertVideoToM3U8 = async (videoUrl: string, segmentCount: number = 4): Promise<VideoConversionResponse> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const response = await fetch(`${API_BASE_URL}/api/services/request/image-converter/video/convert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-key': 'FdEkspWY7giU39dZ',
    },
    body: JSON.stringify({
      videoUrl,
      format: 'm3u8',
      quality: 'high',
      segmentCount
    }),
  });

  if (!response.ok) {
    throw new Error(`Video conversion failed: ${response.statusText}`);
  }

  return response.json();
};