import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !user.authenticated)) {
      // Allow access to login and password-reset pages
      if (location.pathname !== '/login' && location.pathname !== '/password-reset') {
        navigate('/login');
      }
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Allow access to login and password-reset pages without authentication
  if (location.pathname === '/login' || location.pathname === '/password-reset') {
    return <>{children}</>;
  }

  // Require authentication for all other pages
  if (!user || !user.authenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;