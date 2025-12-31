import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
}) => {
  const { user, isAuthenticated } = useAuth();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if store is deactivated (for non-super-admin users)
  if (user?.role !== 'SUPER_ADMIN') {
    const userData = JSON.parse(localStorage.getItem('ironing_shop_user') || '{}');
    if (userData?.store?.isActive === false) {
      return <Navigate to="/store-deactivated" replace />;
    }
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      // User doesn't have permission - redirect to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
