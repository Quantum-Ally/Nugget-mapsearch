'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Heart,
  MapPin,
  Users,
  Filter,
  Download,
  RefreshCw,
  Home,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  EyeOff,
  Clock,
  UserPlus,
  TrendingUp,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

interface OpeningTimes {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

interface Restaurant {
  id?: string;
  name: string;
  slug?: string;
  cuisine: string;
  likes_count: number;
  price_level: number;
  address: string;
  city?: string;
  country?: string;
  phone?: string;
  description?: string;
  latitude: number;
  longitude: number;
  google_maps_url?: string;
  website_url?: string;
  family_friendly: boolean;
  kids_menu: boolean;
  high_chairs: boolean;
  wheelchair_access: boolean;
  outdoor_seating: boolean;
  changing_table: boolean;
  vegetarian_options: boolean;
  vegan_options: boolean;
  gluten_free_options: boolean;
  image_url?: string;
  dog_friendly: boolean;
  playground_nearby: boolean;
  quick_service: boolean;
  good_for_groups: boolean;
  air_conditioning: boolean;
  baby_change_mens: boolean;
  baby_change_unisex: boolean;
  baby_change_womens: boolean;
  buzzy: boolean;
  free_kids_meal: boolean;
  friendly_staff: boolean;
  fun_quirky: boolean;
  games_available: boolean;
  halal: boolean;
  healthy_options: boolean;
  kids_coloring: boolean;
  kids_play_space: boolean;
  kids_potty_toilet: boolean;
  kosher: boolean;
  one_pound_kids_meal: boolean;
  posh: boolean;
  pram_storage: boolean;
  relaxed: boolean;
  small_plates: boolean;
  takeaway: boolean;
  teen_favourite: boolean;
  tourist_attraction_nearby: boolean;
  visible: boolean;
  opening_times?: OpeningTimes;
}

const emptyRestaurant: Restaurant = {
  name: '',
  cuisine: '',
  likes_count: 0,
  price_level: 2,
  address: '',
  city: '',
  country: '',
  phone: '',
  description: '',
  latitude: 0,
  longitude: 0,
  family_friendly: false,
  kids_menu: false,
  high_chairs: false,
  wheelchair_access: false,
  outdoor_seating: false,
  changing_table: false,
  vegetarian_options: false,
  vegan_options: false,
  gluten_free_options: false,
  image_url: '',
  google_maps_url: '',
  website_url: '',
  dog_friendly: false,
  playground_nearby: false,
  quick_service: false,
  good_for_groups: false,
  air_conditioning: false,
  baby_change_mens: false,
  baby_change_unisex: false,
  baby_change_womens: false,
  buzzy: false,
  free_kids_meal: false,
  friendly_staff: false,
  fun_quirky: false,
  games_available: false,
  halal: false,
  healthy_options: false,
  kids_coloring: false,
  kids_play_space: false,
  kids_potty_toilet: false,
  kosher: false,
  one_pound_kids_meal: false,
  posh: false,
  pram_storage: false,
  relaxed: false,
  small_plates: false,
  takeaway: false,
  teen_favourite: false,
  tourist_attraction_nearby: false,
  visible: true,
  opening_times: {},
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [deletingRestaurantId, setDeletingRestaurantId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Restaurant>(emptyRestaurant);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isLocalHeroDialogOpen, setIsLocalHeroDialogOpen] = useState(false);
  const [localHeroFormData, setLocalHeroFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    cityPreference: '',
  });
  const [isCreatingLocalHero, setIsCreatingLocalHero] = useState(false);
  const { toast } = useToast();
  const [stats, setStats] = useState({
    total: 0,
    familyFriendly: 0,
    avgRating: 0,
    topCuisines: [] as { cuisine: string; count: number }[],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[Admin] Auth still loading...');
      return;
    }

    // If no user, redirect to login
    if (!user) {
      console.log('[Admin] No user found, redirecting to login');
      router.push('/login');
      return;
    }

    // If user exists but no profile yet, wait for profile to load
    if (!userProfile) {
      console.log('[Admin] User exists but profile not loaded yet, waiting...');
      return;
    }

    // Check if user has admin role
    if (userProfile.role !== 'admin') {
      console.error('[Admin] User is not an admin:', userProfile.role);
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      router.push('/');
      return;
    }

    // All checks passed, load restaurants
    console.log('[Admin] Admin verified, loading restaurants');
    loadRestaurants();
  }, [user, userProfile, authLoading, router]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.cuisine.toLowerCase().includes(query) ||
          (r.city && r.city.toLowerCase().includes(query)) ||
          r.address.toLowerCase().includes(query)
      );
      setFilteredRestaurants(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, restaurants]);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      // Verify user is still authenticated before making request
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[Admin] Session error during refresh:', sessionError);
        toast({
          title: 'Session Error',
          description: 'There was an error checking your session. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!session) {
        console.error('[Admin] No session found, redirecting to login');
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        // Check if error is auth-related
        if (error.message?.includes('JWT') || error.message?.includes('token') || error.message?.includes('auth')) {
          console.error('[Admin] Auth error during data fetch:', error);
          toast({
            title: 'Authentication Error',
            description: 'Your session is invalid. Please log in again.',
            variant: 'destructive',
          });
          router.push('/login');
          return;
        }
        throw error;
      }

      setRestaurants(data || []);
      setFilteredRestaurants(data || []);
      calculateStats(data || []);

      toast({
        title: 'Success',
        description: 'Restaurants refreshed successfully',
      });
    } catch (error: any) {
      console.error('[Admin] Error loading restaurants:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load restaurants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Restaurant[]) => {
    const total = data.length;
    const familyFriendly = data.filter((r) => r.family_friendly).length;
    const avgLikes =
      data.reduce((sum, r) => sum + (r.likes_count || 0), 0) / total || 0;

    const cuisineCounts = data.reduce((acc, r) => {
      acc[r.cuisine] = (acc[r.cuisine] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCuisines = Object.entries(cuisineCounts)
      .map(([cuisine, count]) => ({ cuisine, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({ total, familyFriendly, avgRating: avgLikes, topCuisines });
  };

  const handleCreate = () => {
    setEditingRestaurant(null);
    setFormData(emptyRestaurant);
    setIsDialogOpen(true);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData(restaurant);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingRestaurantId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingRestaurantId) return;

    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', deletingRestaurantId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Restaurant deleted successfully',
      });

      loadRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete restaurant',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingRestaurantId(null);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.cuisine || !formData.address) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields: name, cuisine, and address',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.city || formData.city.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter a city',
        variant: 'destructive',
      });
      return;
    }

    if (formData.latitude === 0 || formData.longitude === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter valid latitude and longitude coordinates',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const dataToSave = {
        ...formData,
        slug,
        city: formData.city?.trim() || null,
        country: formData.country?.trim() || null,
        phone: formData.phone?.trim() || null,
        description: formData.description?.trim() || null,
        image_url: formData.image_url?.trim() || null,
        website_url: formData.website_url?.trim() || null,
        google_maps_url: formData.google_maps_url?.trim() || null,
        opening_times: formData.opening_times || {},
      };

      if (editingRestaurant?.id) {
        const { error } = await supabase
          .from('restaurants')
          .update(dataToSave)
          .eq('id', editingRestaurant.id);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        toast({
          title: 'Success',
          description: 'Restaurant updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('restaurants')
          .insert([dataToSave]);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        toast({
          title: 'Success',
          description: 'Restaurant created successfully',
        });
      }

      setIsDialogOpen(false);
      loadRestaurants();
    } catch (error: any) {
      console.error('Error saving restaurant:', error);
      const errorMessage = error?.message || 'Failed to save restaurant';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPriceLevelSymbol = (level: number) => {
    return '$'.repeat(level);
  };

  const handleCreateLocalHero = async () => {
    if (!localHeroFormData.email || !localHeroFormData.password || !localHeroFormData.fullName) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingLocalHero(true);
    console.log('Creating Local Hero account...', { email: localHeroFormData.email });

    try {
      console.log('Step 1: Calling signUp...');
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: localHeroFormData.email,
        password: localHeroFormData.password,
        options: {
          data: {
            full_name: localHeroFormData.fullName,
          },
          emailRedirectTo: undefined,
        },
      });

      console.log('Step 1 complete:', { authData, signUpError });

      if (signUpError) {
        console.error('SignUp error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        console.error('No user returned from signUp');
        throw new Error('User creation failed - no user returned');
      }

      console.log('Step 2: Updating user profile role...');
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ role: 'local_hero', role_updated_at: new Date().toISOString() })
        .eq('id', authData.user.id);

      console.log('Step 2 complete:', { profileError });

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      if (localHeroFormData.cityPreference) {
        console.log('Step 3: Creating application record...');
        const { error: applicationError } = await supabase
          .from('local_hero_applications')
          .insert({
            user_id: authData.user.id,
            city_preference: localHeroFormData.cityPreference,
            motivation: 'Created by admin',
            status: 'approved',
            submitted_at: new Date().toISOString(),
            reviewed_at: new Date().toISOString(),
            reviewed_by: user?.id,
          });

        console.log('Step 3 complete:', { applicationError });

        if (applicationError) {
          console.error('Application creation error:', applicationError);
          throw applicationError;
        }

        console.log('Step 4: Creating city assignment...');
        const { error: assignmentError } = await supabase
          .from('local_hero_assignments')
          .insert({
            user_id: authData.user.id,
            city_name: localHeroFormData.cityPreference,
            assigned_by: user?.id,
            is_active: true,
          });

        console.log('Step 4 complete:', { assignmentError });

        if (assignmentError) {
          console.error('Assignment creation error:', assignmentError);
          throw assignmentError;
        }
      }

      console.log('All steps complete! Success!');
      toast({
        title: 'Success',
        description: 'Local Hero account created successfully',
      });

      setIsLocalHeroDialogOpen(false);
      setLocalHeroFormData({
        email: '',
        password: '',
        fullName: '',
        cityPreference: '',
      });
    } catch (error: any) {
      console.error('Error creating Local Hero:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create Local Hero account',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingLocalHero(false);
      console.log('handleCreateLocalHero complete');
    }
  };

  // Show loading state while auth/data is initializing or refreshing
  if (authLoading || (user && !userProfile) || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8dbf65] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={`bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            {!isSidebarCollapsed && (
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Nugget</h2>
                  <p className="text-xs text-slate-500">Admin Panel</p>
                </div>
              </Link>
            )}
            {isSidebarCollapsed && (
              <div className="w-full flex justify-center">
                <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-2 border-b border-slate-200">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </button>
          </div>

          <nav className="flex-1 p-2">
            <div className="space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Homepage"
              >
                <Home className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Homepage</span>}
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 bg-[#8dbf65] text-white rounded-lg"
                title="Dashboard"
              >
                <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Dashboard</span>}
              </Link>
              <Link
                href="/admin/local-heroes"
                className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Manage Local Heroes"
              >
                <TrendingUp className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Local Heroes</span>}
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Manage Users"
              >
                <Users className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Users</span>}
              </Link>
              <Link
                href="/admin/diagnostic"
                className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Authentication Diagnostic"
              >
                <Activity className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Diagnostic</span>}
              </Link>
            </div>
          </nav>

          <div className="p-2 border-t border-slate-200">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage all restaurants and view analytics
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    loadRestaurants();
                  }}
                  className="gap-2"
                  type="button"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  size="sm"
                  className="bg-[#8dbf65] hover:bg-[#7aaa56] gap-2"
                  onClick={handleCreate}
                >
                  <Plus className="h-4 w-4" />
                  Add Restaurant
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsLocalHeroDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Create Local Hero
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
              <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-slate-600 mt-1">
                {stats.familyFriendly} family-friendly
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Likes</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
              <p className="text-xs text-slate-600 mt-1">Across all restaurants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Cuisine</CardTitle>
              <MapPin className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.topCuisines[0]?.cuisine || 'N/A'}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {stats.topCuisines[0]?.count || 0} restaurants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Search Results</CardTitle>
              <Filter className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredRestaurants.length}</div>
              <p className="text-xs text-slate-600 mt-1">Matching filters</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Restaurants</CardTitle>
                <CardDescription>
                  View and manage all restaurant listings
                </CardDescription>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, cuisine, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Cuisine</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRestaurants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                          No restaurants found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRestaurants
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((restaurant) => (
                        <TableRow key={restaurant.id}>
                          <TableCell className="font-medium">
                            {restaurant.name}
                          </TableCell>
                          <TableCell>{restaurant.cuisine}</TableCell>
                          <TableCell>{restaurant.city}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" />
                              <span className="font-medium">{restaurant.likes_count || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-600">
                              {getPriceLevelSymbol(restaurant.price_level)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {restaurant.visible ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Visible
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                Hidden
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {restaurant.family_friendly && (
                                <Badge variant="secondary" className="text-xs">
                                  Family
                                </Badge>
                              )}
                              {restaurant.kids_menu && (
                                <Badge variant="secondary" className="text-xs">
                                  Kids Menu
                                </Badge>
                              )}
                              {restaurant.high_chairs && (
                                <Badge variant="secondary" className="text-xs">
                                  High Chairs
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={async () => {
                                  if (!restaurant.id) return;
                                  const { error } = await supabase
                                    .from('restaurants')
                                    .update({ visible: !restaurant.visible })
                                    .eq('id', restaurant.id);

                                  if (!error) {
                                    loadRestaurants();
                                    toast({
                                      title: 'Success',
                                      description: `Restaurant ${restaurant.visible ? 'hidden' : 'made visible'}`,
                                    });
                                  }
                                }}
                                title={restaurant.visible ? 'Hide restaurant' : 'Show restaurant'}
                              >
                                {restaurant.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(restaurant)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => restaurant.id && handleDelete(restaurant.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            {!loading && filteredRestaurants.length > 0 && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-slate-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRestaurants.length)} of {filteredRestaurants.length} restaurants
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(filteredRestaurants.length / itemsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                        if (page === 2 && currentPage <= 3) return true;
                        if (page === totalPages - 1 && currentPage >= totalPages - 2) return true;
                        return false;
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        return (
                          <>
                            {showEllipsis && (
                              <span key={`ellipsis-${page}`} className="px-2 text-slate-400">...</span>
                            )}
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className={currentPage === page ? "bg-[#8dbf65] hover:bg-[#7aaa56]" : ""}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </>
                        );
                      })
                    }
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredRestaurants.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(filteredRestaurants.length / itemsPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
            </DialogTitle>
            <DialogDescription>
              {editingRestaurant
                ? 'Update the restaurant information below'
                : 'Fill in the details to add a new restaurant'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter restaurant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine *</Label>
                <Input
                  id="cuisine"
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  placeholder="e.g., Italian, Chinese"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United Kingdom"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="51.5074"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="-0.1278"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_level">Price Level</Label>
                <Select
                  value={(formData.price_level || 2).toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, price_level: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">$ - Budget</SelectItem>
                    <SelectItem value="2">$$ - Moderate</SelectItem>
                    <SelectItem value="3">$$$ - Expensive</SelectItem>
                    <SelectItem value="4">$$$$ - Very Expensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="visible" className="cursor-pointer font-semibold">
                    Restaurant Visibility
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    {formData.visible ? 'This restaurant is visible to the public' : 'This restaurant is hidden from the public'}
                  </p>
                </div>
                <Switch
                  id="visible"
                  checked={formData.visible}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, visible: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="likes_count">Likes Count</Label>
              <Input
                id="likes_count"
                type="number"
                value={formData.likes_count}
                onChange={(e) =>
                  setFormData({ ...formData, likes_count: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+44 20 1234 5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter a brief description of the restaurant..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  value={formData.website_url || ''}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://www.restaurant.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google_maps_url">Google Maps URL</Label>
                <Input
                  id="google_maps_url"
                  value={formData.google_maps_url || ''}
                  onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-slate-600" />
                <Label className="font-semibold text-base">Opening Hours</Label>
              </div>
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const dayHours = formData.opening_times?.[day as keyof OpeningTimes];
                return (
                  <div key={day} className="grid grid-cols-12 gap-3 items-center">
                    <Label className="col-span-3 capitalize">{day}</Label>
                    <div className="col-span-3">
                      <Input
                        type="time"
                        value={dayHours?.open || ''}
                        onChange={(e) => {
                          const newOpeningTimes = { ...formData.opening_times };
                          if (!newOpeningTimes[day as keyof OpeningTimes]) {
                            newOpeningTimes[day as keyof OpeningTimes] = { open: '', close: '' };
                          }
                          newOpeningTimes[day as keyof OpeningTimes]!.open = e.target.value;
                          if (newOpeningTimes[day as keyof OpeningTimes]!.closed) {
                            newOpeningTimes[day as keyof OpeningTimes]!.closed = false;
                          }
                          setFormData({ ...formData, opening_times: newOpeningTimes });
                        }}
                        disabled={dayHours?.closed}
                        placeholder="09:00"
                      />
                    </div>
                    <span className="col-span-1 text-center text-slate-500">to</span>
                    <div className="col-span-3">
                      <Input
                        type="time"
                        value={dayHours?.close || ''}
                        onChange={(e) => {
                          const newOpeningTimes = { ...formData.opening_times };
                          if (!newOpeningTimes[day as keyof OpeningTimes]) {
                            newOpeningTimes[day as keyof OpeningTimes] = { open: '', close: '' };
                          }
                          newOpeningTimes[day as keyof OpeningTimes]!.close = e.target.value;
                          if (newOpeningTimes[day as keyof OpeningTimes]!.closed) {
                            newOpeningTimes[day as keyof OpeningTimes]!.closed = false;
                          }
                          setFormData({ ...formData, opening_times: newOpeningTimes });
                        }}
                        disabled={dayHours?.closed}
                        placeholder="17:00"
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Switch
                        checked={dayHours?.closed || false}
                        onCheckedChange={(checked) => {
                          const newOpeningTimes = { ...formData.opening_times };
                          if (!newOpeningTimes[day as keyof OpeningTimes]) {
                            newOpeningTimes[day as keyof OpeningTimes] = { open: '', close: '' };
                          }
                          newOpeningTimes[day as keyof OpeningTimes]!.closed = checked;
                          setFormData({ ...formData, opening_times: newOpeningTimes });
                        }}
                      />
                      <Label className="text-xs text-slate-600">Closed</Label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <Label>Features & Amenities</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="family_friendly" className="cursor-pointer">
                    Family Friendly
                  </Label>
                  <Switch
                    id="family_friendly"
                    checked={formData.family_friendly}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, family_friendly: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="kids_menu" className="cursor-pointer">
                    Kids Menu
                  </Label>
                  <Switch
                    id="kids_menu"
                    checked={formData.kids_menu}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, kids_menu: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="high_chairs" className="cursor-pointer">
                    High Chairs
                  </Label>
                  <Switch
                    id="high_chairs"
                    checked={formData.high_chairs}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, high_chairs: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="changing_table" className="cursor-pointer">
                    Changing Table
                  </Label>
                  <Switch
                    id="changing_table"
                    checked={formData.changing_table}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, changing_table: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="wheelchair_access" className="cursor-pointer">
                    Wheelchair Access
                  </Label>
                  <Switch
                    id="wheelchair_access"
                    checked={formData.wheelchair_access}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, wheelchair_access: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="outdoor_seating" className="cursor-pointer">
                    Outdoor Seating
                  </Label>
                  <Switch
                    id="outdoor_seating"
                    checked={formData.outdoor_seating}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, outdoor_seating: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="dog_friendly" className="cursor-pointer">
                    Dog Friendly
                  </Label>
                  <Switch
                    id="dog_friendly"
                    checked={formData.dog_friendly}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, dog_friendly: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="playground_nearby" className="cursor-pointer">
                    Playground Nearby
                  </Label>
                  <Switch
                    id="playground_nearby"
                    checked={formData.playground_nearby}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, playground_nearby: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="quick_service" className="cursor-pointer">
                    Quick Service
                  </Label>
                  <Switch
                    id="quick_service"
                    checked={formData.quick_service}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, quick_service: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="good_for_groups" className="cursor-pointer">
                    Good for Groups
                  </Label>
                  <Switch
                    id="good_for_groups"
                    checked={formData.good_for_groups}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, good_for_groups: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="vegetarian_options" className="cursor-pointer">
                    Vegetarian Options
                  </Label>
                  <Switch
                    id="vegetarian_options"
                    checked={formData.vegetarian_options}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, vegetarian_options: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="vegan_options" className="cursor-pointer">
                    Vegan Options
                  </Label>
                  <Switch
                    id="vegan_options"
                    checked={formData.vegan_options}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, vegan_options: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="gluten_free_options" className="cursor-pointer">
                    Gluten-Free Options
                  </Label>
                  <Switch
                    id="gluten_free_options"
                    checked={formData.gluten_free_options}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, gluten_free_options: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="halal" className="cursor-pointer">
                    Halal
                  </Label>
                  <Switch
                    id="halal"
                    checked={formData.halal}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, halal: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="kosher" className="cursor-pointer">
                    Kosher
                  </Label>
                  <Switch
                    id="kosher"
                    checked={formData.kosher}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, kosher: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="healthy_options" className="cursor-pointer">
                    Healthy Options
                  </Label>
                  <Switch
                    id="healthy_options"
                    checked={formData.healthy_options}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, healthy_options: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="small_plates" className="cursor-pointer">
                    Small Plates
                  </Label>
                  <Switch
                    id="small_plates"
                    checked={formData.small_plates}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, small_plates: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="takeaway" className="cursor-pointer">
                    Takeaway
                  </Label>
                  <Switch
                    id="takeaway"
                    checked={formData.takeaway}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, takeaway: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="air_conditioning" className="cursor-pointer">
                    Air Conditioning
                  </Label>
                  <Switch
                    id="air_conditioning"
                    checked={formData.air_conditioning}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, air_conditioning: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="games_available" className="cursor-pointer">
                    Games Available
                  </Label>
                  <Switch
                    id="games_available"
                    checked={formData.games_available}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, games_available: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="free_kids_meal" className="cursor-pointer">
                    Free Kids Meal
                  </Label>
                  <Switch
                    id="free_kids_meal"
                    checked={formData.free_kids_meal}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, free_kids_meal: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="one_pound_kids_meal" className="cursor-pointer">
                    £1 Kids Meal
                  </Label>
                  <Switch
                    id="one_pound_kids_meal"
                    checked={formData.one_pound_kids_meal}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, one_pound_kids_meal: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="kids_coloring" className="cursor-pointer">
                    Kids Coloring
                  </Label>
                  <Switch
                    id="kids_coloring"
                    checked={formData.kids_coloring}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, kids_coloring: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="kids_play_space" className="cursor-pointer">
                    Kids Play Space
                  </Label>
                  <Switch
                    id="kids_play_space"
                    checked={formData.kids_play_space}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, kids_play_space: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="kids_potty_toilet" className="cursor-pointer">
                    Kids Potty/Toilet
                  </Label>
                  <Switch
                    id="kids_potty_toilet"
                    checked={formData.kids_potty_toilet}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, kids_potty_toilet: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="baby_change_mens" className="cursor-pointer">
                    Baby Change (Men's)
                  </Label>
                  <Switch
                    id="baby_change_mens"
                    checked={formData.baby_change_mens}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, baby_change_mens: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="baby_change_womens" className="cursor-pointer">
                    Baby Change (Women's)
                  </Label>
                  <Switch
                    id="baby_change_womens"
                    checked={formData.baby_change_womens}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, baby_change_womens: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="baby_change_unisex" className="cursor-pointer">
                    Baby Change (Unisex)
                  </Label>
                  <Switch
                    id="baby_change_unisex"
                    checked={formData.baby_change_unisex}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, baby_change_unisex: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="pram_storage" className="cursor-pointer">
                    Pram Storage
                  </Label>
                  <Switch
                    id="pram_storage"
                    checked={formData.pram_storage}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, pram_storage: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="teen_favourite" className="cursor-pointer">
                    Teen Favourite
                  </Label>
                  <Switch
                    id="teen_favourite"
                    checked={formData.teen_favourite}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, teen_favourite: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="tourist_attraction_nearby" className="cursor-pointer">
                    Tourist Attraction Nearby
                  </Label>
                  <Switch
                    id="tourist_attraction_nearby"
                    checked={formData.tourist_attraction_nearby}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, tourist_attraction_nearby: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="buzzy" className="cursor-pointer">
                    Buzzy
                  </Label>
                  <Switch
                    id="buzzy"
                    checked={formData.buzzy}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, buzzy: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="relaxed" className="cursor-pointer">
                    Relaxed
                  </Label>
                  <Switch
                    id="relaxed"
                    checked={formData.relaxed}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, relaxed: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="posh" className="cursor-pointer">
                    Posh
                  </Label>
                  <Switch
                    id="posh"
                    checked={formData.posh}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, posh: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="fun_quirky" className="cursor-pointer">
                    Fun & Quirky
                  </Label>
                  <Switch
                    id="fun_quirky"
                    checked={formData.fun_quirky}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, fun_quirky: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="friendly_staff" className="cursor-pointer">
                    Friendly Staff
                  </Label>
                  <Switch
                    id="friendly_staff"
                    checked={formData.friendly_staff}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, friendly_staff: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#8dbf65] hover:bg-[#7aaa56]"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : editingRestaurant ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the restaurant
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isLocalHeroDialogOpen} onOpenChange={setIsLocalHeroDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#8dbf65]" />
              Create Local Hero Account
            </DialogTitle>
            <DialogDescription>
              Create a new Local Hero user account with admin approval
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hero-email">Email Address *</Label>
              <Input
                id="hero-email"
                type="email"
                value={localHeroFormData.email}
                onChange={(e) =>
                  setLocalHeroFormData({ ...localHeroFormData, email: e.target.value })
                }
                placeholder="hero@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-password">Password *</Label>
              <Input
                id="hero-password"
                type="password"
                value={localHeroFormData.password}
                onChange={(e) =>
                  setLocalHeroFormData({ ...localHeroFormData, password: e.target.value })
                }
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-name">Full Name *</Label>
              <Input
                id="hero-name"
                value={localHeroFormData.fullName}
                onChange={(e) =>
                  setLocalHeroFormData({ ...localHeroFormData, fullName: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-city">City Assignment (Optional)</Label>
              <Input
                id="hero-city"
                value={localHeroFormData.cityPreference}
                onChange={(e) =>
                  setLocalHeroFormData({ ...localHeroFormData, cityPreference: e.target.value })
                }
                placeholder="London, Manchester, etc."
              />
              <p className="text-xs text-slate-500">
                Assign this Local Hero to a specific city. Leave blank to assign later.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsLocalHeroDialogOpen(false);
                setLocalHeroFormData({
                  email: '',
                  password: '',
                  fullName: '',
                  cityPreference: '',
                });
              }}
              disabled={isCreatingLocalHero}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#8dbf65] hover:bg-[#7aaa56]"
              onClick={handleCreateLocalHero}
              disabled={isCreatingLocalHero}
            >
              {isCreatingLocalHero ? 'Creating...' : 'Create Local Hero'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
