import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RequireAuthProps {
  children: ReactNode;
  intent?: string;
}

/**
 * Guards a route so only signed-in users can access it.
 * If the user is not authenticated, they are redirected to /auth
 * with the original location + intent preserved so the auth page
 * can send them back after a successful sign-in.
 */
export function RequireAuth({ children, intent }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-page py-24 flex items-center justify-center">
        <div className="text-sm text-slate-500 animate-pulse">Checking your session…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location.pathname, intent }}
      />
    );
  }

  return <>{children}</>;
}
