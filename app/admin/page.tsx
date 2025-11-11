import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies });

  // Get session server-side with timeout to avoid hanging in deployment
  let sessionUser = null as any;
  try {
    const getSessionPromise = supabase.auth.getSession();
    const sessionResult = (await Promise.race([
      getSessionPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('auth_session_timeout')), 2000)),
    ])) as any;

    sessionUser = sessionResult?.data?.session?.user || null;
  } catch (e: any) {
    // If auth session check times out or fails, redirect to login
    redirect('/login');
  }

  // Redirect if no user
  if (!sessionUser) {
    redirect('/login');
  }

  // Get user profile with role (with timeout)
  let userProfile: any = null;
  try {
    const profilePromise = supabase
      .from('user_profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    const profileResult = (await Promise.race([
      profilePromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('profile_timeout')), 2000)),
    ])) as any;

    if (profileResult?.error) {
      redirect('/');
    }
    userProfile = profileResult?.data || null;
  } catch (e: any) {
    redirect('/');
  }

  // Redirect if not admin
  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/');
  }

  // Fetch initial restaurants data server-side (with timeout)
  let restaurants: any[] = [];
  try {
    const restaurantsPromise = supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true });

    const restaurantsResult = (await Promise.race([
      restaurantsPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('restaurants_timeout')), 2500)),
    ])) as any;

    restaurants = restaurantsResult?.data || [];
  } catch {
    restaurants = [];
  }

  return (
    <AdminDashboard
      initialUser={sessionUser}
      initialUserProfile={userProfile}
      initialRestaurants={restaurants}
    />
  );
}