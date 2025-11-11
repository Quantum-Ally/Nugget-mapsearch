'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { MapboxMap } from '@/components/MapboxMap';
import { FilterPanel, FilterState } from '@/components/FilterPanel';
import { QuickAddRestaurantModal } from '@/components/QuickAddRestaurantModal';
import { MobileSearchModal } from '@/components/MobileSearchModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Restaurant } from '@/lib/dummy-restaurants';
import { supabase } from '@/lib/supabase/client';
import { parseNaturalLanguageQuery, buildSupabaseQuery } from '@/lib/natural-language-search';
import { Search, MapPin, Heart, SlidersHorizontal, UtensilsCrossed, Bookmark, Menu, Home, Crown, Store, Settings, User, TrendingUp, Shield, LogOut, X, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, userProfile, permissions, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredCity, setFilteredCity] = useState<string | null>(null);
  const [cityCoordinates, setCityCoordinates] = useState<[number, number] | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; cuisine: string; address: string; type: 'restaurant' | 'city' }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    cuisines: [],
    kidsMenu: false,
    highChairs: false,
    changingTable: false,
    wheelchairAccess: false,
    babyChangeWomens: false,
    babyChangeUnisex: false,
    babyChangeMens: false,
    kidsPottyToilet: false,
    pramStorage: false,
    outdoorSeating: false,
    playgroundNearby: false,
    airConditioning: false,
    dogFriendly: false,
    vegetarianOptions: false,
    veganOptions: false,
    glutenFreeOptions: false,
    smallPlates: false,
    healthyOptions: false,
    halal: false,
    kosher: false,
    funQuirky: false,
    relaxed: false,
    buzzy: false,
    posh: false,
    goodForGroups: false,
    kidsColoring: false,
    gamesAvailable: false,
    kidsPlaySpace: false,
    teenFavourite: false,
    quickService: false,
    friendlyStaff: false,
    takeaway: false,
    freeKidsMeal: false,
    onePoundKidsMeal: false,
    touristAttractionNearby: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const placeholders = [
    "Try: 'Italian with kids menu'",
    "Search: 'cheap vegan near London'",
    "Find: 'Japanese with high chairs'",
    "Look for: 'outdoor seating and wifi'",
    "Discover: 'pizza place with parking'",
    "Explore: 'family-friendly brunch'",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside filter panel and outside filter toggle button
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(target) &&
        !(target as Element).closest('[data-filter-toggle]')
      ) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilters]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      loadRestaurants();
    }

    // Remove focus from search input and hide suggestions on page load
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }

    // Mark initial load as complete after a brief delay
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 500);
  }, [searchParams]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      performSearch(query);
    } else {
      loadRestaurants();
    }
  }, [filters]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      fetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      fetchUserBookmarks();
      fetchUserLikes();
    } else {
      setBookmarkedIds(new Set());
      setLikedIds(new Set());
    }
  }, [user]);

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/restaurants?type=suggestions&q=${encodeURIComponent(query)}`);
      const { data, error } = await response.json();

      if (error) throw new Error(error);

      setSuggestions(data || []);
      // Don't show suggestions on initial page load
      if (!isInitialLoad.current) {
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSuggestionClick = (suggestion: { id: string; name: string; type: 'restaurant' | 'city' }) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    if (suggestion.type === 'city') {
      router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
    } else {
      router.push(`/restaurant/${suggestion.id}`);
    }
  };

  const fetchUserBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('restaurant_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const ids = new Set((data || []).map(f => f.restaurant_id));
      setBookmarkedIds(ids);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('liked', true);

      if (error) throw error;

      const ids = new Set((data || []).map(r => r.restaurant_id));
      setLikedIds(ids);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const toggleBookmark = async (restaurantId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const isCurrentlyBookmarked = bookmarkedIds.has(restaurantId);

      if (isCurrentlyBookmarked) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId);

        if (error) throw error;

        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(restaurantId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            restaurant_id: restaurantId,
          });

        if (error) throw error;

        setBookmarkedIds(prev => new Set(prev).add(restaurantId));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const toggleLike = async (restaurantId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const isCurrentlyLiked = likedIds.has(restaurantId);

      if (isCurrentlyLiked) {
        const { error } = await supabase
          .from('reviews')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId)
          .eq('liked', true);

        if (error) throw error;

        await supabase.rpc('decrement_likes', { restaurant_id: restaurantId });

        setLikedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(restaurantId);
          return newSet;
        });

        setRestaurants(prev => prev.map(r =>
          r.id === restaurantId
            ? { ...r, likesCount: Math.max((r.likesCount || 0) - 1, 0) }
            : r
        ));
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            restaurant_id: restaurantId,
            liked: true,
          });

        if (error) throw error;

        await supabase.rpc('increment_likes', { restaurant_id: restaurantId });

        setLikedIds(prev => new Set(prev).add(restaurantId));

        setRestaurants(prev => prev.map(r =>
          r.id === restaurantId
            ? { ...r, likesCount: (r.likesCount || 0) + 1 }
            : r
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  useEffect(() => {
    if (searchQuery) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [searchQuery, placeholders.length]);

  const loadRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ type: 'all' });

      // Add filter parameters
      if (filters.cuisines.length > 0) {
        params.append('cuisines', filters.cuisines.join(','));
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (key !== 'cuisines' && value === true) {
          params.append(key, 'true');
        }
      });

      const response = await fetch(`/api/restaurants?${params.toString()}`);
      const { data, error } = await response.json();

      if (error) {
        console.error('API error:', error);
        throw new Error(error);
      }

      console.log('Loaded restaurants:', data?.length || 0);
      console.log('First restaurant sample:', data?.[0]);

      const formattedRestaurants: Restaurant[] = (data || []).map((r: any) => {
        const coords: [number, number] = [r.longitude || 0, r.latitude || 0];
        console.log(`Restaurant ${r.name}: coords [${coords[0]}, ${coords[1]}]`);

        return {
          id: r.id,
          name: r.name,
          cuisine: r.cuisine,
          rating: r.rating || 0,
          reviewCount: r.review_count || 0,
          priceLevel: r.price_level || 2,
          address: r.address,
          coordinates: coords,
          imageUrl: r.image_url || 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400',
          familyFriendly: r.family_friendly,
          kidsMenu: r.kids_menu,
          highChairs: r.high_chairs,
          changingTable: r.changing_table,
          likesCount: r.likes_count || 0,
        };
      });

      console.log('Formatted restaurants:', formattedRestaurants.length);
      setRestaurants(formattedRestaurants);

      if (formattedRestaurants.length > 0) {
        console.log('Setting selected restaurant:', formattedRestaurants[0].name);
        setSelectedRestaurant(formattedRestaurants[0]);
      } else {
        console.warn('No restaurants found!');
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setError(error instanceof Error ? error.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setFilteredCity(null);
    setCityCoordinates(null);
    console.log('Performing search for:', query);

    try {
      const params = new URLSearchParams({
        type: 'search',
        q: query
      });

      // Add filter parameters
      if (filters.cuisines.length > 0) {
        params.append('cuisines', filters.cuisines.join(','));
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (key !== 'cuisines' && value === true) {
          params.append(key, 'true');
        }
      });

      const response = await fetch(`/api/restaurants?${params.toString()}`);
      const { data, error, city, cityCoordinates } = await response.json();

      if (error) {
        console.error('Search query error:', error);
        throw new Error(error);
      }

      console.log('Search results count:', data?.length || 0);
      console.log('City filter:', city);
      console.log('City coordinates:', cityCoordinates);

      if (city) {
        setFilteredCity(city);
      }

      if (cityCoordinates) {
        setCityCoordinates(cityCoordinates);
      }

      const formattedRestaurants: Restaurant[] = (data || []).map((r: any) => {
        const coords: [number, number] = [r.longitude || 0, r.latitude || 0];
        return {
          id: r.id,
          name: r.name,
          cuisine: r.cuisine,
          rating: r.rating || 0,
          reviewCount: r.review_count || 0,
          priceLevel: r.price_level || 2,
          address: r.address,
          coordinates: coords,
          imageUrl: r.image_url || 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400',
          familyFriendly: r.family_friendly,
          kidsMenu: r.kids_menu,
          highChairs: r.high_chairs,
          changingTable: r.changing_table,
          likesCount: r.likes_count || 0,
        };
      });

      console.log('Formatted search results:', formattedRestaurants.length);
      setRestaurants(formattedRestaurants);

      if (formattedRestaurants.length > 0) {
        setSelectedRestaurant(formattedRestaurants[0]);
      } else {
        console.warn('No restaurants found for search:', query);
      }
    } catch (error) {
      console.error('Error searching restaurants:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      setError(error instanceof Error ? error.message : 'Failed to search restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markers = useMemo(() => restaurants.map(restaurant => ({
    id: restaurant.id,
    coordinates: restaurant.coordinates,
    title: restaurant.name,
    description: restaurant.address,
  })), [restaurants]);

  const mapCenter = useMemo(() =>
    cityCoordinates || selectedRestaurant?.coordinates,
    [cityCoordinates, selectedRestaurant?.coordinates]
  );

  return (
    <div className="flex h-screen bg-white">
      <div className="hidden lg:block">
        <Sidebar onAddClick={() => setShowAddModal(true)} />
      </div>
      <QuickAddRestaurantModal open={showAddModal} onOpenChange={setShowAddModal} />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
                  alt="MapSearch"
                  className="h-16 w-auto"
                />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {user ? (
                  <>
                    {!permissions.canAccessOwnerDashboard && (
                      <Link
                        href="/saved"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Bookmark className="h-5 w-5" />
                        <span className="font-medium">Saved Places</span>
                      </Link>
                    )}

                    <Link
                      href="/subscription"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Crown className="h-5 w-5" />
                      <span className="font-medium">My Subscription</span>
                    </Link>

                    {permissions.canAccessOwnerDashboard && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Restaurant Owner</p>
                        </div>
                        <Link
                          href="/owner/dashboard"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Store className="h-5 w-5" />
                          <span className="font-medium">Owner Dashboard</span>
                        </Link>
                        <Link
                          href="/owner/restaurants"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="h-5 w-5" />
                          <span className="font-medium">Manage Restaurants</span>
                        </Link>
                      </>
                    )}

                    {permissions.canAccessLocalHeroDashboard && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Local Hero</p>
                        </div>
                        <Link
                          href="/local-hero/dashboard"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <TrendingUp className="h-5 w-5" />
                          <span className="font-medium">Hero Dashboard</span>
                        </Link>
                      </>
                    )}

                    {permissions.canApplyAsLocalHero && !permissions.canAccessOwnerDashboard && (
                      <Link
                        href="/local-hero/apply"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Become a Local Hero</span>
                      </Link>
                    )}

                    {permissions.canAccessAdminPanel && (
                      <>
                        <div className="pt-4 pb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Administration</p>
                        </div>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Shield className="h-5 w-5" />
                          <span className="font-medium">Admin Dashboard</span>
                        </Link>
                        <Link
                          href="/admin/users"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          <span className="font-medium">Manage Users</span>
                        </Link>
                        <Link
                          href="/admin/local-heroes"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <TrendingUp className="h-5 w-5" />
                          <span className="font-medium">Manage Local Heroes</span>
                        </Link>
                      </>
                    )}

                  </>
                ) : (
                  <>
                    <Link
                      href="/owner/register"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Store className="h-5 w-5" />
                      <span className="font-medium">For Restaurants</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <MobileSearchModal
        open={mobileSearchOpen}
        onOpenChange={setMobileSearchOpen}
        initialQuery={searchQuery}
      />

      <Drawer open={showFilters} onOpenChange={setShowFilters}>
        <DrawerContent className="max-h-[85vh] lg:hidden" overlayClassName="lg:hidden">
          <DrawerHeader className="text-left border-b border-slate-200 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DrawerTitle className="text-lg font-bold text-slate-900">Filters</DrawerTitle>
                {Object.entries(filters).filter(([key, value]) => {
                  if (key === 'cuisines') return value.length > 0;
                  return value === true;
                }).length > 0 && (
                  <Badge variant="secondary" className="bg-[#8dbf65] text-white">
                    {Object.entries(filters).filter(([key, value]) => {
                      if (key === 'cuisines') return value.length > 0;
                      return value === true;
                    }).length}
                  </Badge>
                )}
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto p-6">
            <FilterPanel onFilterChange={setFilters} expanded={true} />
          </div>
        </DrawerContent>
      </Drawer>

      <div className="flex flex-1 lg:ml-16 overflow-hidden flex-col lg:flex-row w-full h-full">
        <div className="w-full lg:w-[640px] flex flex-col bg-white lg:border-r border-slate-200 h-1/2 lg:h-full order-2 lg:order-1">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="h-10 w-10 flex-shrink-0"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1" onClick={() => setMobileSearchOpen(true)}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder={searchQuery || "london"}
                  value={searchQuery}
                  readOnly
                  className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 rounded-full cursor-pointer"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-11 w-11 p-0 border-slate-300 rounded-xl flex-shrink-0"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-200">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div ref={searchRef} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={placeholders[placeholderIndex]}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className={`pl-10 h-11 bg-slate-50 border-slate-200 rounded-lg transition-opacity duration-300 ${
                    isAnimating ? 'opacity-60' : 'opacity-100'
                  }`}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${suggestion.id}-${index}`}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          {suggestion.type === 'city' ? (
                            <Globe className="h-5 w-5 text-[#8dbf65] mt-0.5 flex-shrink-0" />
                          ) : (
                            <MapPin className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            {suggestion.type === 'city' ? (
                              <>
                                <div className="font-semibold text-slate-900 truncate">{suggestion.name}</div>
                                <div className="text-sm text-slate-600">Search all restaurants in this city</div>
                              </>
                            ) : (
                              <>
                                <div className="font-semibold text-slate-900 truncate">{suggestion.name}</div>
                                <div className="text-sm text-slate-600 truncate">{suggestion.cuisine}</div>
                                <div className="text-xs text-slate-500 truncate">{suggestion.address}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>
            <Button
              type="submit"
              size="sm"
              className="h-11 px-4 bg-[#8dbf65] hover:bg-[#7aaa56] rounded-lg"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              data-filter-toggle
              className={`h-11 px-4 rounded-lg relative ${
                Object.entries(filters).some(([key, value]) => key === 'cuisines' ? value.length > 0 : value === true)
                  ? 'border-[#8dbf65] bg-[#8dbf65]/10'
                  : 'border-slate-300'
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {Object.entries(filters).some(([key, value]) => key === 'cuisines' ? value.length > 0 : value === true) && (
                <span className="absolute -top-1 -right-1 bg-[#8dbf65] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {Object.entries(filters).filter(([key, value]) => key === 'cuisines' ? value.length > 0 : value === true).length}
                </span>
              )}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto relative flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-full"
                >
                  Restaurants
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 rounded-full"
                >
                  Discounts
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 rounded-full"
                >
                  Events
                </Button>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {filteredCity
                  ? `${restaurants.length} Family-Friendly Restaurant${restaurants.length !== 1 ? 's' : ''} in ${filteredCity}`
                  : 'Family-Friendly Restaurants'
                }
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="border-slate-200">
                      <Skeleton className="h-32 w-full rounded-t-lg" />
                      <CardContent className="pt-3">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : restaurants.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No restaurants found</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : 'No restaurants are currently available.'}
                  </p>
                </div>
              ) : (
                restaurants.map((restaurant) => (
                  <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} prefetch={false}>
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-lg border-slate-200 overflow-hidden ${
                        selectedRestaurant?.id === restaurant.id ? 'ring-2 ring-[#8dbf65]' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRestaurant(restaurant);
                      }}
                    >
                      <div className="relative h-32 w-full overflow-hidden">
                        <img
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 flex gap-2">
                          <button
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50"
                            onClick={(e) => toggleLike(restaurant.id, e)}
                          >
                            <Heart
                              className={`h-4 w-4 ${likedIds.has(restaurant.id) ? 'text-red-500 fill-red-500' : 'text-slate-600'}`}
                            />
                          </button>
                          <button
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50"
                            onClick={(e) => toggleBookmark(restaurant.id, e)}
                          >
                            <Bookmark
                              className={`h-4 w-4 ${bookmarkedIds.has(restaurant.id) ? 'text-blue-600 fill-blue-600' : 'text-slate-600'}`}
                            />
                          </button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm text-slate-900 mb-1 line-clamp-1">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                            <span className="font-medium text-xs">{restaurant.likesCount || 0}</span>
                            <span className="text-xs text-slate-500">likes</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">{restaurant.address}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 h-1/2 lg:h-screen order-1 lg:order-2 relative">
          <div
            ref={filterPanelRef}
            className={`hidden lg:block bg-white border-r border-slate-200 overflow-y-auto transition-all duration-300 ease-in-out relative z-10 ${
              showFilters ? 'w-80' : 'w-20'
            }`}
          >
            <FilterPanel onFilterChange={setFilters} expanded={showFilters} />
          </div>

          <div className="flex-1 relative">
            <MapboxMap
              coordinates={mapCenter}
              markers={markers}
              onMarkerClick={(id) => {
                const restaurant = restaurants.find(r => r.id === id);
                if (restaurant) setSelectedRestaurant(restaurant);
              }}
              zoom={mapCenter ? 13 : 11}
            />
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200">
              <div className="flex items-center gap-2 text-sm">
                <UtensilsCrossed className="h-4 w-4 text-slate-600" />
                <span className="font-medium text-slate-900">{restaurants.length}</span>
                <span className="text-slate-600">
                  {filteredCity
                    ? `family-friendly restaurant${restaurants.length !== 1 ? 's' : ''} in ${filteredCity}`
                    : 'family-friendly restaurants found'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 ml-16 flex flex-col">
          <Skeleton className="h-16 w-full" />
          <div className="flex flex-1">
            <div className="w-[560px] p-6">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
