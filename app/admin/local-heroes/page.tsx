'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, MapPin, User, Home, LayoutDashboard, Users, Activity, LogOut, Menu, X, TrendingUp, RefreshCw } from 'lucide-react';
import { LocalHeroApplication } from '@/lib/types/roles';
import Link from 'next/link';

export default function AdminLocalHeroesPage() {
  const { user, userProfile, permissions, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<LocalHeroApplication[]>([]);
  const [localHeroes, setLocalHeroes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<LocalHeroApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newCityAssignment, setNewCityAssignment] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    // Wait for auth bootstrap
    if (authLoading) return;

    // If not logged in, send to login
    if (!user) {
      router.push('/login?redirect=/admin/local-heroes');
      return;
    }

    // If profile not yet available, wait
    if (!userProfile) return;

    // Check permission once we have profile
    if (!permissions.canManageLocalHeroes) {
      router.push('/');
      return;
    }

    loadData();
    loadCities();
  }, [authLoading, user, userProfile, permissions, router]);

  const loadCities = async () => {
    try {
      const { data } = await supabase
        .from('restaurants')
        .select('city')
        .not('city', 'is', null)
        .neq('city', '');

      if (data) {
        const uniqueCities = Array.from(new Set(data.map(r => r.city))).sort();
        setAvailableCities(uniqueCities);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadData = async () => {
    try {
      const { data: appsData } = await supabase
        .from('local_hero_applications')
        .select('*, user_profiles!local_hero_applications_user_id_fkey(email, full_name)')
        .order('submitted_at', { ascending: false });

      const { data: heroesData } = await supabase
        .from('user_profiles')
        .select('*, local_hero_assignments!local_hero_assignments_user_id_fkey(city_name, is_active)')
        .eq('role', 'local_hero');

      setApplications(appsData || []);
      setLocalHeroes(heroesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (application: LocalHeroApplication) => {
    try {
      const { error: updateError } = await supabase
        .from('local_hero_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          admin_notes: reviewNotes,
        })
        .eq('id', application.id);

      if (updateError) throw updateError;

      const { error: roleError } = await supabase
        .from('user_profiles')
        .update({ role: 'local_hero', role_updated_at: new Date().toISOString() })
        .eq('id', application.user_id);

      if (roleError) throw roleError;

      const { error: assignmentError } = await supabase
        .from('local_hero_assignments')
        .insert({
          user_id: application.user_id,
          city_name: application.city_preference,
          is_active: true,
        });

      if (assignmentError) throw assignmentError;

      setSelectedApp(null);
      setReviewNotes('');
      loadData();
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleRejectApplication = async (application: LocalHeroApplication) => {
    try {
      const { error } = await supabase
        .from('local_hero_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          admin_notes: reviewNotes,
        })
        .eq('id', application.id);

      if (error) throw error;

      setSelectedApp(null);
      setReviewNotes('');
      loadData();
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleAddCityAssignment = async (userId: string) => {
    if (!newCityAssignment.trim()) return;

    try {
      const { error } = await supabase
        .from('local_hero_assignments')
        .insert({
          user_id: userId,
          city_name: newCityAssignment.trim(),
          is_active: true,
        });

      if (error) throw error;

      setNewCityAssignment('');
      loadData();
    } catch (error) {
      console.error('Error adding city assignment:', error);
    }
  };

  const handleRemoveCityAssignment = async (userId: string, cityName: string) => {
    try {
      const { error } = await supabase
        .from('local_hero_assignments')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('city_name', cityName);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error removing city assignment:', error);
    }
  };

  // Loading states while auth or page data is initializing
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

  if (!permissions.canManageLocalHeroes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');

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
                className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Dashboard"
              >
                <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Dashboard</span>}
              </Link>
              <Link
                href="/admin/local-heroes"
                className="flex items-center gap-3 px-3 py-2 bg-[#8dbf65] text-white rounded-lg"
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
                <h1 className="text-2xl font-bold text-slate-900">Local Heroes Management</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Review applications and manage Local Hero assignments
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingApplications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Local Heroes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{localHeroes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
      </div>

      {pendingApplications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((app: any) => (
                <div key={app.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">{app.user_profiles?.full_name || 'Unknown'}</h3>
                      <p className="text-sm text-muted-foreground">{app.user_profiles?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{app.city_preference}</span>
                      </div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div>
                      <Label className="text-sm font-semibold">Motivation</Label>
                      <p className="text-sm">{app.motivation}</p>
                    </div>
                    {app.experience && (
                      <div>
                        <Label className="text-sm font-semibold">Experience</Label>
                        <p className="text-sm">{app.experience}</p>
                      </div>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedApp(app)}>Review Application</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Review Application</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Admin Notes</Label>
                          <Textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add notes about your decision..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => selectedApp && handleApproveApplication(selectedApp)}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => selectedApp && handleRejectApplication(selectedApp)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Local Heroes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {localHeroes.map((hero: any) => (
              <div key={hero.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {hero.full_name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{hero.email}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <Label className="text-sm font-semibold mb-2 block">Assigned Cities</Label>
                  <div className="flex flex-wrap gap-2">
                    {hero.local_hero_assignments
                      ?.filter((a: any) => a.is_active)
                      .map((assignment: any) => (
                        <Badge key={assignment.city_name} variant="secondary" className="gap-2">
                          {assignment.city_name}
                          <button
                            onClick={() => handleRemoveCityAssignment(hero.id, assignment.city_name)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      )) || <span className="text-sm text-muted-foreground">No cities assigned</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={newCityAssignment}
                    onValueChange={setNewCityAssignment}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select city to assign..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => handleAddCityAssignment(hero.id)}
                    disabled={!newCityAssignment}
                  >
                    Add City
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
