// Authentication API service
import { handleApiError } from '@/lib/apiErrorHandler';
import { getApiHeaders } from '@/lib/apiHeaders';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface LoginRequest {
  apikeyUserId: string
  password: string
  deviceId: string
}

export interface ResetPasswordRequest {
  password: string
}

export interface AuthStatusResponse {
  status: number
  payload: {
    authenticated: boolean
    userId?: string
    deviceId?: string
    masterSession?: boolean
    isApiKey?: boolean
    sessionId?: string
    expires?: string
  }
}

// Login with API key user
export const login = async (loginData: LoginRequest): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/services/request/auth/apikey-user/login`, {
    method: 'POST',
    credentials: 'include', // Include cookies
    headers: getApiHeaders(),
    body: JSON.stringify(loginData),
  })

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json()
}

// Reset password using API key
export const resetPassword = async (apiKey: string, password: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/services/request/auth/apikey-user/reset-pwd`, {
    method: 'POST',
    headers: getApiHeaders({ 'x-api-key': apiKey }),
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json()
}

// Check authentication status
export const getAuthStatus = async (): Promise<AuthStatusResponse> => {
  const headers = getApiHeaders({});
  if (import.meta.env.DEV) {
    const response = await fetch(`${API_BASE_URL}/api/apikey/status?apiKey=${import.meta.env.VITE_DEV_API_KEY}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    const data: {
      "status": number,
      "payload": {
        "createdAt": string,
        "updatedAt": string,
        "_id": string,
        "expiresAt": string,
        "name": string,
        "masterKey": boolean
      }
    } = await response.json();

    return {
      status: data.status,
      payload: {
        authenticated: true,
        isApiKey: true,
        userId: data.payload._id,
        deviceId: 'Dev Environment',
        masterSession: data.payload.masterKey,
        sessionId: data.payload._id,
        expires: data.payload.expiresAt,
      }
    };
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
    method: 'GET',
    credentials: 'include', // Include cookies
    headers,
  })

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json()
}

// Generate device ID
export const generateDeviceId = (): string => {
  const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' :
    navigator.userAgent.includes('Firefox') ? 'Firefox' :
      navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser'
  const location = 'Device'
  return `${browser} - ${location}`
}