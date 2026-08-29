import { useAuth } from '@clerk/clerk-react';
import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl font-semibold text-blue-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  return isSignedIn ? <Outlet /> : <Navigate to='/sign-in' />;
}
