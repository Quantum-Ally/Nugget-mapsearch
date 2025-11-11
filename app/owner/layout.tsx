'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  Ticket,
  TrendingUp,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const isRegisterPage = pathname === '/owner/register';

  useEffect(() => {
    if (!loading && !user && !isRegisterPage) {
      router.push('/login?redirect=/owner/dashboard');
    }
  }, [user, loading, router, isRegisterPage]);

  useEffect(() => {
    if (!loading && user && userProfile && userProfile.role !== 'owner' && userProfile.role !== 'admin' && !isRegisterPage) {
      router.push('/');
    }
  }, [userProfile, loading, user, router, isRegisterPage]);

  if (isRegisterPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="w-20 bg-white border-r border-slate-200 p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/owner/dashboard', icon: LayoutDashboard },
    { name: 'My Restaurants', href: '/owner/restaurants', icon: Store },
    { name: 'Add Restaurant', href: '/owner/restaurants/new', icon: PlusCircle },
    { name: 'Coupons & Deals', href: '/owner/coupons', icon: Ticket },
    { name: 'Marketing', href: '/owner/marketing', icon: TrendingUp },
    { name: 'Analytics', href: '/owner/analytics', icon: BarChart3 },
    { name: 'Billing', href: '/owner/billing', icon: CreditCard },
    { name: 'Settings', href: '/owner/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarExpanded ? 'w-64' : 'w-20'}`}
      >
        <div className="h-full flex flex-col">
          <div className={`p-4 border-b border-slate-200 ${sidebarExpanded ? '' : 'px-4'}`}>
            <div className="flex items-center justify-between">
              {sidebarExpanded ? (
                <>
                  <Link href="/owner/dashboard" className="flex items-center gap-2">
                    <img
                      src="/nugget_name_only_logo_01.png"
                      alt="Nugget"
                      className="h-8"
                    />
                  </Link>
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      setSidebarExpanded(false);
                    }}
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSidebarExpanded(true)}
                  className="w-full flex items-center justify-center text-slate-700 hover:text-slate-900"
                >
                  <Menu className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center ${sidebarExpanded ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#8dbf65] text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                    title={!sidebarExpanded ? item.name : ''}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarExpanded && (
                      <>
                        <span className="font-medium">{item.name}</span>
                        {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className={`p-3 border-t border-slate-200 ${sidebarExpanded ? '' : 'px-2'}`}>
            {sidebarExpanded && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  {userProfile.full_name || 'Owner'}
                </p>
                <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
                <Badge className="mt-2 bg-[#8dbf65] hover:bg-[#8dbf65]">
                  {userProfile.role === 'admin' ? 'Admin' : 'Owner'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-700 hover:text-slate-900"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
                View Public Site
              </Link>
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
