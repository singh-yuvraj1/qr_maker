import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait for auth hydration before deciding
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the attempted location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
