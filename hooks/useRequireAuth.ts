import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types/roles';

interface UseRequireAuthOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
  redirectIfAuthorized?: string;
  allowAdminOverride?: boolean;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const {
    requiredRole,
    redirectTo = '/login',
    redirectIfAuthorized,
    allowAdminOverride = false,
  } = options;

  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Check if user is logged in
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // If we need userProfile for role checking, wait for it
    if (requiredRole && !userProfile) {
      // Profile is still loading, keep waiting
      return;
    }

    // Check role requirement
    if (requiredRole) {
      const roleMatches = userProfile?.role === requiredRole;
      const adminOverride = allowAdminOverride && userProfile?.role === 'admin';

      if (!roleMatches && !adminOverride) {
        router.push('/');
        return;
      }
    }

    // Check if we should redirect authorized users
    if (redirectIfAuthorized && user && userProfile) {
      router.push(redirectIfAuthorized);
      return;
    }

    // All checks passed
    setIsAuthorized(true);
    setIsChecking(false);
  }, [authLoading, user, userProfile, requiredRole, redirectTo, redirectIfAuthorized, allowAdminOverride, router]);

  return {
    isAuthorized,
    isChecking: authLoading || isChecking,
    user,
    userProfile,
  };
}
