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

export const getImageUrl = (filename: string): string => {
  return `${STATIC_SERVER_URL}/${filename}`;
};