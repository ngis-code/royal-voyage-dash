import { handleApiError } from '@/lib/apiErrorHandler';
import { getApiHeaders } from '@/lib/apiHeaders';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface GuestMessageResponseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  /** The ID of the guest message */
  messageId: string;
  /** Room id */
  _createdBy: string;
  responses: {
    questionId: string;
    response: string;
  }[] | null;
  status: "delivered" | "read" | "answered";
  deleted: boolean;
  deletedAt: Date | null;
}

export interface GuestMessageSummary {
  totalDeliveries: number;
  totalRead: number;
  totalReplied: number;
  responses: Record<string, Record<string, number>>;
}

export interface GuestMessageSummaryResponse {
  status: number;
  payload: GuestMessageSummary;
}

export interface GuestMessageResponsesResponse {
  status: number;
  payload: {
    documents: GuestMessageResponseDocument[];
    canAccessAllDocuments: boolean;
    pagination: {
      offset: number;
      limit: number;
      total: number;
    };
  };
}

export async function getGuestMessageSummary(messageId: string): Promise<GuestMessageSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/services/request/guest-messaging/summary/${messageId}`, {
    method: 'GET',
    credentials: 'include',
    headers: getApiHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function listGuestMessagesResponses(params: { 
  messageId: string; 
  limit?: number; 
  offset?: number; 
  filter?: Partial<GuestMessageResponseDocument>; 
  sort?: Record<string, 'asc' | 'desc'> 
}): Promise<GuestMessageResponsesResponse> {
  const sortParameter: Record<string, 1 | -1> | undefined = params.sort 
    ? Object.fromEntries(Object.entries(params.sort).map(([k, v]) => [k, v === 'asc' ? 1 : -1])) 
    : undefined;

  const response = await fetch(`${API_BASE_URL}/api/databases/list-documents`, {
    method: 'POST',
    credentials: 'include',
    headers: getApiHeaders(),
    body: JSON.stringify({
      databaseId: "royaltv_main",
      collectionId: "guest_message_responses",
      limit: params.limit ?? 25,
      offset: params.offset ?? 0,
      messageId: params.messageId,
      ...params.filter,
      $sort: sortParameter
    })
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}