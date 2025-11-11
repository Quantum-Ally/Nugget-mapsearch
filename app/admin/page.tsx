import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export const runtime = 'nodejs';

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies });

  // Get session server-side
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect if no user
  if (!session?.user) {
    redirect('/login');
  }

  // Get user profile with role
  const { data: userProfile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  // Redirect if not admin
  if (error || !userProfile || userProfile.role !== 'admin') {
    redirect('/');
  }

  // Fetch initial restaurants data server-side
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .order('name', { ascending: true });

  return (
    <AdminDashboard
      initialUser={session.user}
      initialUserProfile={userProfile}
      initialRestaurants={restaurants || []}
    />
  );
}