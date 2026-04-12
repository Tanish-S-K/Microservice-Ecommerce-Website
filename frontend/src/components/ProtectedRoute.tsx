import { Navigate } from 'react-router-dom';
import { PropsWithChildren } from 'react';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
