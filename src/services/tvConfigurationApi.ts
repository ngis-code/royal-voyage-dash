import { handleApiError } from '@/lib/apiErrorHandler';
import { getApiHeaders } from '@/lib/apiHeaders';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface TvConfiguration {
  /** MAC address as the unique identifier */
  _id: string;
  /** Serial ID of the device */
  serial_id: string;
  /** Room/Cabin ID */
  room_id: string;
  /** Permissions array */
  _permissions: Array<{
    scope: string;
    operation: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TvConfigurationResponse {
  status: number;
  payload: {
    documents: TvConfiguration[];
    canAccessAllDocuments: boolean;
    pagination: {
      offset: number;
      limit: number;
      total: number;
    };
  };
}

export async function listTvConfigurations(params: { 
  limit?: number; 
  offset?: number; 
  filter?: Record<string, any>; 
  sort?: Record<string, 'asc' | 'desc'> 
}): Promise<TvConfigurationResponse> {
  const sortParameter: Record<string, 1 | -1> | undefined = params.sort 
    ? Object.fromEntries(Object.entries(params.sort).map(([k, v]) => [k, v === 'asc' ? 1 : -1])) 
    : undefined;

  const response = await fetch(`${API_BASE_URL}/api/databases/list-documents`, {
    method: 'POST',
    credentials: 'include',
    headers: getApiHeaders(),
    body: JSON.stringify({
      databaseId: "royaltv_main",
      collectionId: "tv_configuration",
      limit: params.limit ?? 25,
      offset: params.offset ?? 0,
      ...params.filter,
      $sort: sortParameter
    })
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function createTvConfiguration(macAddress: string, config: {
  serial_id: string;
  room_id: string;
}): Promise<TvConfiguration> {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/tv_configuration/${macAddress}`, {
    method: 'POST',
    credentials: 'include',
    headers: getApiHeaders(),
    body: JSON.stringify({
      ...config,
      _permissions: [
        {
          scope: `user(${config.room_id})`,
          operation: "read"
        }
      ]
    })
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function updateTvConfiguration(macAddress: string, config: {
  serial_id: string;
  room_id: string;
}): Promise<TvConfiguration> {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/tv_configuration/${macAddress}`, {
    method: 'PUT',
    credentials: 'include',
    headers: getApiHeaders(),
    body: JSON.stringify({
      ...config,
      _permissions: [
        {
          scope: `user(${config.room_id})`,
          operation: "read"
        }
      ]
    })
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function deleteTvConfiguration(macAddress: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/tv_configuration/${macAddress}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: getApiHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }
}