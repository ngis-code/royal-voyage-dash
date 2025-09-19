import { getApiHeaders } from "@/lib/apiHeaders";
import { handleApiError } from "@/lib/apiErrorHandler";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface GuestMessageTemplate {
  _id: string;
  name: string;
  subject: string;
  description: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  mediaOrientation?: "horizontal" | "vertical";
  questions: {
    question: string;
    options: {
      text: string;
      icon: string;
    }[];
    _id: string;
  }[];
  tags: string[];
  type: "action" | "survey" | "notification";
  createdAt: string;
  updatedAt: string;
}

export interface GuestMessageTemplateResponse {
  documents: GuestMessageTemplate[];
  canAccessAllDocuments: boolean;
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

export const listGuestMessageTemplates = async (): Promise<GuestMessageTemplateResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/databases/list-documents`, {
    method: 'POST',
    credentials: 'include',
    headers: getApiHeaders(),
    body: JSON.stringify({
      databaseId: "royaltv_main",
      collectionId: "guest_message_templates",
      limit: 0
    })
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  return data.payload;
};

export const createGuestMessageTemplate = async (template: Omit<GuestMessageTemplate, '_id' | 'createdAt' | 'updatedAt'>): Promise<GuestMessageTemplate> => {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/guest_message_templates/`, {
    method: 'POST',
    credentials: 'include',
    headers: getApiHeaders(),
    body: JSON.stringify(template)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const updateGuestMessageTemplate = async (templateId: string, update: Partial<Omit<GuestMessageTemplate, '_id' | 'createdAt' | 'updatedAt'>>): Promise<GuestMessageTemplate> => {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/guest_message_templates/${templateId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: getApiHeaders(),
    body: JSON.stringify(update)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const deleteGuestMessageTemplate = async (templateId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/guest_message_templates/${templateId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: getApiHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};