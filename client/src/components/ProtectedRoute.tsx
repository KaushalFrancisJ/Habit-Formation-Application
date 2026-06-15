import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Spinner } from './Spinner.tsx';
import type { ReactNode } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
