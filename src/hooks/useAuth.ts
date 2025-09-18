import { useState, useEffect } from 'react';
import { getAuthStatus } from '@/services/authApi';

export interface AuthUser {
  authenticated: boolean;
  userId?: string;
  deviceId?: string;
  masterSession?: boolean;
  isApiKey?: boolean;
  sessionId?: string;
  expires?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await getAuthStatus();
      setUser(response.payload);
    } catch (error) {
      setUser({ authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, checkAuth };
};