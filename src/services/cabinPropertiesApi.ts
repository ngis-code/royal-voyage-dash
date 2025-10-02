import { handleApiError } from '@/lib/apiErrorHandler';
import { getApiHeaders } from '@/lib/apiHeaders';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CabinProperties {
  _id: string;
  Cabin?: string;
  Deck?: string;
  DeckDesc?: string;
  CabinDesign?: string;
  CabinType?: string;
  CabinTypeDesc?: string;
  MusterStation?: string;
  MusterStationDesc?: string;
  CabinStatus?: string;
  _createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  _permissions?: {
    scope: string;
    operation: "read" | "create" | "update" | "delete";
  }[];
}

export interface CabinPropertiesResponse {
  status: number;
  payload: {
    documents: CabinProperties[];
    canAccessAllDocuments: boolean;
    pagination: {
      offset: number;
      limit: number;
      total: number;
    };
  };
}

export async function listCabinProperties(params: {
  limit?: number;
  offset?: number;
  filter?: Partial<CabinProperties>;
  sort?: Record<string, 'asc' | 'desc'>;
}): Promise<CabinPropertiesResponse> {
  const sortParameter: Record<string, 1 | -1> | undefined = params.sort
    ? Object.fromEntries(Object.entries(params.sort).map(([k, v]) => [k, v === 'asc' ? 1 : -1]))
    : undefined;

  const response = await fetch(`${API_BASE_URL}/api/databases/list-documents`, {
    method: 'POST',
    credentials: 'include',
    headers: getApiHeaders(),
    body: JSON.stringify({
      databaseId: 'royaltv_main',
      collectionId: 'cabin_properties',
      limit: params.limit ?? 25,
      offset: params.offset ?? 0,
      ...params.filter,
      $sort: sortParameter,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

export async function createCabinProperty(
  data: Omit<CabinProperties, '_id' | 'createdAt' | 'updatedAt' | '_createdBy' | '_permissions'>
): Promise<CabinProperties> {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/cabin_properties/${data.Cabin}`, {
    method: 'POST',
    credentials: 'include',
    headers: getApiHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const result = await response.json();
  return result.payload;
}

export async function updateCabinProperty(
  cabin: string,
  data: Partial<Omit<CabinProperties, '_id' | 'createdAt' | 'updatedAt' | '_createdBy' | '_permissions'>>
): Promise<CabinProperties> {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/cabin_properties/${cabin}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: getApiHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const result = await response.json();
  return result.payload;
}

export async function deleteCabinProperty(propertyId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/cabin_properties/${propertyId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: getApiHeaders(),
  });

  if (!response.ok) {
    await handleApiError(response);
  }
}
