import { useEffect, useRef, useState } from 'react';
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
  const profileWaitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing timer when dependencies change
    if (profileWaitTimerRef.current) {
      window.clearTimeout(profileWaitTimerRef.current);
      profileWaitTimerRef.current = null;
    }

    // Still loading auth
    if (authLoading) {
      return;
    }

    // Not logged in
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // If no specific role required, authorize even if profile hasn't loaded yet
    if (!requiredRole) {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    // If requiredRole is present but profile not yet available, start a max-wait timer
    if (!userProfile) {
      profileWaitTimerRef.current = window.setTimeout(() => {
        // After timeout, fail safe: if we cannot verify role, do not keep spinning
        if (allowAdminOverride) {
          // We can't confirm admin without profile, so redirect to home
          router.push('/');
        } else {
          router.push('/');
        }
        setIsAuthorized(false);
        setIsChecking(false);
      }, 2500);
      return;
    }

    // Role check with admin override
    const roleMatches = userProfile.role === requiredRole;
    const adminOverride = allowAdminOverride && userProfile.role === 'admin';
    if (!roleMatches && !adminOverride) {
      router.push('/');
      return;
    }

    // Redirect authorized users if needed
    if (redirectIfAuthorized) {
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
