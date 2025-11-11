import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const supabase = createClient();

  // Get session server-side with timeout to avoid hanging in deployment
  let sessionUser: any = null;
  try {
    const getSessionPromise = supabase.auth.getSession();
    const sessionResult = (await Promise.race([
      getSessionPromise as any,
      new Promise((_, reject) => setTimeout(() => reject(new Error('auth_session_timeout')), 2000)),
    ])) as any;

    sessionUser = sessionResult?.data?.session?.user || null;
  } catch (e: any) {
    redirect('/login');
  }

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
      profilePromise as any,
      new Promise((_, reject) => setTimeout(() => reject(new Error('profile_timeout')), 2000)),
    ])) as any;

    if (profileResult?.error) {
      redirect('/');
    }
    userProfile = profileResult?.data || null;
  } catch (e: any) {
    redirect('/');
  }

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
      restaurantsPromise as any,
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