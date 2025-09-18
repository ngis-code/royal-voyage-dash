// Authentication API service
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`)
  }

  return response.json()
}

// Reset password using API key
export const resetPassword = async (apiKey: string, password: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/services/request/auth/apikey-user/reset-pwd`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    throw new Error(`Password reset failed: ${response.statusText}`)
  }

  return response.json()
}

// Check authentication status
export const getAuthStatus = async (): Promise<AuthStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
    method: 'GET',
    credentials: 'include', // Include cookies
  })

  if (!response.ok) {
    throw new Error(`Auth status check failed: ${response.statusText}`)
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