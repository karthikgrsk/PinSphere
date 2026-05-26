import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-softBg">
        <div className="flex flex-col items-center gap-4">
          {/* Pinterest-like loading pulse animation */}
          <div className="h-12 w-12 animate-pulse rounded-full bg-brand-red"></div>
          <p className="font-sans text-sm font-medium text-brand-gray animate-pulse">Loading PinSphere...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
