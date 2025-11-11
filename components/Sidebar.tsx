'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Search, Menu, User, Settings, Bookmark, LogOut, Store, BarChart3, CreditCard, Megaphone, Tag, Shield, TrendingUp, Crown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SuggestRestaurantModal } from '@/components/SuggestRestaurantModal';
import { getRoleName } from '@/lib/permissions';

interface SidebarProps {
  onAddClick?: () => void;
}

export function Sidebar({ onAddClick }: SidebarProps = {}) {
  const { user, userProfile, permissions, signOut } = useAuth();
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const renderDropdownContent = () => {
    if (!userProfile) return null;

    const isOwner = userProfile.role === 'owner' || permissions.canAccessOwnerDashboard;
    const isLocalHero = userProfile.role === 'local_hero' || permissions.canAccessLocalHeroDashboard;
    const isAdmin = userProfile.role === 'admin' || permissions.canAccessAdminPanel;

    return (
      <>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{userProfile.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <Badge className="w-fit mt-1">{getRoleName(userProfile.role)}</Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isOwner && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Restaurant Owner
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/owner/dashboard" className="flex items-center cursor-pointer">
                <Store className="mr-2 h-4 w-4" />
                <span>Owner Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/restaurants" className="flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>My Restaurants</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/analytics" className="flex items-center cursor-pointer">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/marketing" className="flex items-center cursor-pointer">
                <Megaphone className="mr-2 h-4 w-4" />
                <span>Marketing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/coupons" className="flex items-center cursor-pointer">
                <Tag className="mr-2 h-4 w-4" />
                <span>Coupons</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/billing" className="flex items-center cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/owner/settings" className="flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {isLocalHero && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Local Hero
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/local-hero" className="flex items-center cursor-pointer">
                <TrendingUp className="mr-2 h-4 w-4" />
                <span>Hero Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {isAdmin && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Administration
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/users" className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Manage Users</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {!isOwner && !isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/saved" className="flex items-center cursor-pointer">
                <Bookmark className="mr-2 h-4 w-4" />
                <span>Saved Places</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSuggestModal(true)} className="cursor-pointer">
              <Store className="mr-2 h-4 w-4" />
              <span>Suggest a Restaurant</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/subscription" className="flex items-center cursor-pointer">
                <Crown className="mr-2 h-4 w-4" />
                <span>My Subscription</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </>
    );
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 z-50">
        <button className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg mb-8">
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-4 flex-1">
          <Link href="/search">
            <button className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg">
              <Search className="h-5 w-5" />
            </button>
          </Link>

          <Link href="/saved">
            <button className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg">
              <Bookmark className="h-5 w-5" />
            </button>
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {userProfile?.role === 'owner' || userProfile?.role === 'admin' ? (
            <button
              onClick={onAddClick}
              className="w-10 h-10 flex items-center justify-center text-white bg-[#8dbf65] hover:bg-[#7aaa56] rounded-lg"
              title="Add Restaurant"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          ) : (
            <button
              onClick={() => setShowSuggestModal(true)}
              className="w-10 h-10 flex items-center justify-center text-white bg-[#8dbf65] hover:bg-[#7aaa56] rounded-lg"
              title="Suggest a Restaurant"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-slate-900 text-white">
                      {getInitials(user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {renderDropdownContent()}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <button
                className="w-10 h-10 flex items-center justify-center text-white bg-[#8dbf65] hover:bg-[#7aaa56] rounded-full"
              >
                <User className="h-5 w-5" />
              </button>
            </Link>
          )}
        </div>
      </div>

      <SuggestRestaurantModal open={showSuggestModal} onOpenChange={setShowSuggestModal} />
    </>
  );
}
