'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { UserRole, UserProfile as UserProfileType, Subscription, LocalHeroAssignment } from '@/lib/types/roles';
import { getRolePermissions, RolePermissions } from '@/lib/permissions';

export type { UserRole };

export interface UserProfile extends UserProfileType {
  subscriptions?: Subscription[];
  assignedCities?: string[];
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  permissions: RolePermissions;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signUpAsOwner: (email: string, password: string, fullName: string, businessName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getAssignedCities: () => string[];
  hasCustomerPro: () => boolean;
  hasOwnerPro: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<RolePermissions>(getRolePermissions(null, []));
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const router = useRouter();

  const loadUserProfile = async (userId: string) => {
    // Prevent duplicate loads
    if (isLoadingProfile) {
      console.log('[AuthContext] Profile load already in progress, skipping...');
      return;
    }

    try {
      console.log('[AuthContext] Loading profile for user:', userId);
      setIsLoadingProfile(true);

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('[AuthContext] Profile query result:', { profileData, profileError });

      if (profileError) {
        console.error('[AuthContext] Profile query error:', profileError);
        throw profileError;
      }

      if (!profileData) {
        console.warn('[AuthContext] No profile data found for user:', userId);
        setUserProfile(null);
        setPermissions(getRolePermissions(null, []));
        return;
      }

      console.log('[AuthContext] Profile loaded:', profileData.role, profileData.email);

      const { data: subscriptionsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (subsError) {
        console.error('[AuthContext] Subscriptions query error:', subsError);
      }

      const { data: assignmentsData, error: assignError } = await supabase
        .from('local_hero_assignments')
        .select('city_name')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (assignError) {
        console.error('[AuthContext] Assignments query error:', assignError);
      }

      const profile: UserProfile = {
        ...profileData,
        subscriptions: subscriptionsData || [],
        assignedCities: assignmentsData?.map((a: any) => a.city_name) || [],
      };

      setUserProfile(profile);
      setPermissions(getRolePermissions(profile.role, profile.subscriptions || []));
      console.log('[AuthContext] Profile state updated successfully');
    } catch (error) {
      console.error('[AuthContext] Fatal error loading user profile:', error);
      setUserProfile(null);
      setPermissions(getRolePermissions(null, []));
    } finally {
      setIsLoadingProfile(false);
      console.log('[AuthContext] Profile loading completed');
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Initializing authentication...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('[AuthContext] Session retrieved:', session ? 'User logged in' : 'No session');

        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            console.log('[AuthContext] Loading user profile for:', session.user.email);
            await loadUserProfile(session.user.id);
            if (mounted) setLoading(false);
          } else {
            console.log('[AuthContext] No user session found');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Fatal error during auth initialization:', err);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('[AuthContext] Auth state changed:', event, session ? 'User present' : 'No user');

      // Handle SIGNED_OUT event explicitly
      if (event === 'SIGNED_OUT') {
        console.log('[AuthContext] User signed out, clearing all state');
        setUser(null);
        setUserProfile(null);
        setPermissions(getRolePermissions(null, []));
        setLoading(false);
        return;
      }

      // Handle TOKEN_REFRESHED event
      if (event === 'TOKEN_REFRESHED') {
        console.log('[AuthContext] Token refreshed');
        setUser(session?.user ?? null);
        // Only set loading to false if we already have a profile loaded
        // Otherwise, let the normal flow load the profile
        if (userProfile && mounted) {
          console.log('[AuthContext] Profile already loaded, skipping reload');
          setLoading(false);
        } else if (session?.user && mounted) {
          console.log('[AuthContext] No profile loaded yet, loading now');
          try {
            await loadUserProfile(session.user.id);
          } catch (err) {
            console.error('[AuthContext] Error loading profile on token refresh:', err);
            if (mounted) {
              setUserProfile(null);
              setPermissions(getRolePermissions(null, []));
            }
          } finally {
            if (mounted) setLoading(false);
          }
        } else {
          if (mounted) setLoading(false);
        }
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          await loadUserProfile(session.user.id);
        } catch (err) {
          console.error('[AuthContext] Error loading profile after auth change:', err);
          // Keep user but clear profile on error
          if (mounted) {
            setUserProfile(null);
            setPermissions(getRolePermissions(null, []));
          }
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        setUserProfile(null);
        setPermissions(getRolePermissions(null, []));
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    // Use Supabase's built-in OAuth for simplicity
    // The edge function is available if custom handling is needed
    const redirectUrl = 'https://nuggetrecovery.vercel.app/login';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/signup`
        : undefined;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || '',
          },
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        return { error };
      }

      return { error: null };
    } catch (err: any) {
      console.error('Signup failed:', err);

      // Check for common error patterns
      if (err.message?.includes('ERR_NAME_NOT_RESOLVED') || err.message?.includes('Failed to fetch')) {
        return {
          error: {
            message: 'Cannot connect to authentication service. Please check your Supabase credentials in the .env file.',
            name: 'ConnectionError',
            status: 0,
          } as any,
        };
      }

      return {
        error: {
          message: err.message || 'An unexpected error occurred during signup',
          name: 'UnknownError',
          status: 500,
        } as any,
      };
    }
  };

  const signUpAsOwner = async (email: string, password: string, fullName: string, businessName: string) => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/owner/register`
      : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          business_name: businessName,
        },
      },
    });

    if (error) return { error };

    if (data.user) {
      await supabase
        .from('user_profiles')
        .update({ role: 'owner' })
        .eq('id', data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    try {
      console.log('[AuthContext] Signing out...');

      // Clear local state first
      setUser(null);
      setUserProfile(null);
      setPermissions(getRolePermissions(null, []));

      // Sign out from Supabase with scope: 'local' to clear cookies
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      if (error) {
        console.error('[AuthContext] Error during signOut:', error);
      } else {
        console.log('[AuthContext] Successfully signed out from Supabase');
      }

      // Additional cleanup: Clear any lingering storage
      if (typeof window !== 'undefined') {
        try {
          // Clear Supabase-related items from localStorage
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('supabase.auth.')) {
              localStorage.removeItem(key);
            }
          });
        } catch (storageError) {
          console.error('[AuthContext] Error clearing storage:', storageError);
        }
      }

      console.log('[AuthContext] Local state cleared, redirecting to home...');

      // Use window.location for a hard redirect to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('[AuthContext] Fatal error signing out:', error);
      // Still try to clear local state and redirect
      setUser(null);
      setUserProfile(null);
      setPermissions(getRolePermissions(null, []));

      if (typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        router.push('/');
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const getAssignedCities = (): string[] => {
    return userProfile?.assignedCities || [];
  };

  const hasCustomerPro = (): boolean => {
    return userProfile?.subscriptions?.some(
      sub => sub.subscription_type === 'customer_subscription' && sub.plan_tier === 'pro' && sub.status === 'active'
    ) || false;
  };

  const hasOwnerPro = (): boolean => {
    return userProfile?.subscriptions?.some(
      sub => sub.subscription_type === 'owner_subscription' && sub.plan_tier === 'pro' && sub.status === 'active'
    ) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        permissions,
        signIn,
        signInWithGoogle,
        signUp,
        signUpAsOwner,
        signOut,
        refreshProfile,
        getAssignedCities,
        hasCustomerPro,
        hasOwnerPro
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
