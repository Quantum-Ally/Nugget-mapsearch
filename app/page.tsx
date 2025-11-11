'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { MobileSearchModal } from '@/components/MobileSearchModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Navigation, Globe, Heart, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateWebsiteStructuredData } from '@/lib/structured-data';
import { supabase } from '@/lib/supabase/client';

interface FeaturedRestaurant {
  id: string;
  name: string;
  cuisine: string;
  likesCount: number;
  address: string;
  imageUrl: string;
  isBookmarked?: boolean;
}

const placeholderTexts = [
  "Search for Italian with kids menu near London",
  "Search for cheap vegan outdoor seating",
  "Search for Japanese with high chairs in Manchester",
  "Search for family-friendly pizza near me",
  "Search for restaurants with play area and parking",
  "Search for gluten-free options with baby changing",
];

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; cuisine: string; address: string; type: 'restaurant' | 'city' }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<FeaturedRestaurant[]>([]);
  const [londonRestaurants, setLondonRestaurants] = useState<FeaturedRestaurant[]>([]);
  const [placeholderText, setPlaceholderText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const websiteStructuredData = generateWebsiteStructuredData();
  const searchRef = useRef<HTMLDivElement>(null);

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
    let charIndex = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
      const currentText = placeholderTexts[currentTextIndex];

      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setPlaceholderText(currentText.substring(0, charIndex + 1));
          charIndex++;
          timeout = setTimeout(type, 50);
        } else {
          timeout = setTimeout(() => {
            isDeleting = true;
            type();
          }, 2000);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholderText(currentText.substring(0, charIndex - 1));
          charIndex--;
          timeout = setTimeout(type, 30);
        } else {
          isDeleting = false;
          setCurrentTextIndex((prev) => (prev + 1) % placeholderTexts.length);
        }
      }
    };

    timeout = setTimeout(type, 100);

    return () => clearTimeout(timeout);
  }, [currentTextIndex]);

  useEffect(() => {
    const loadRestaurants = async () => {
      const featured = await fetchFeaturedRestaurants();
      if (featured && featured.length > 0) {
        await fetchLondonRestaurants(featured);
      }
    };
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserBookmarks();
      fetchUserLikes();
    } else {
      setBookmarkedIds(new Set());
      setLikedIds(new Set());
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      fetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/restaurants?type=suggestions&q=${encodeURIComponent(query)}`);
      const { data, error } = await response.json();

      if (error) throw new Error(error);

      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchFeaturedRestaurants = async () => {
    console.log('[HomePage] Fetching featured restaurants...');
    try {
      const response = await fetch('/api/restaurants?type=featured');
      const { data, error } = await response.json();

      if (error) {
        console.error('[HomePage] Error fetching featured restaurants:', error);
        throw new Error(error);
      }

      console.log('[HomePage] Featured restaurants fetched:', data?.length || 0);

      const formatted: FeaturedRestaurant[] = (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        likesCount: r.likes_count || 0,
        address: r.address,
        imageUrl: r.image_url || 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400',
      }));

      setFeaturedRestaurants(formatted);
      return formatted;
    } catch (error) {
      console.error('Error fetching featured restaurants:', error);
      return [];
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

        setFeaturedRestaurants(prev => prev.map(r =>
          r.id === restaurantId
            ? { ...r, likesCount: Math.max((r.likesCount || 0) - 1, 0) }
            : r
        ));
        setLondonRestaurants(prev => prev.map(r =>
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

        setFeaturedRestaurants(prev => prev.map(r =>
          r.id === restaurantId
            ? { ...r, likesCount: (r.likesCount || 0) + 1 }
            : r
        ));
        setLondonRestaurants(prev => prev.map(r =>
          r.id === restaurantId
            ? { ...r, likesCount: (r.likesCount || 0) + 1 }
            : r
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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

  const fetchLondonRestaurants = async (excludeRestaurants: FeaturedRestaurant[] = []) => {
    console.log('[HomePage] Fetching London restaurants...');
    try {
      const featuredIds = excludeRestaurants.length > 0 ? excludeRestaurants.map(r => r.id) : [];
      const excludeParam = featuredIds.length > 0 ? `&exclude=${featuredIds.join(',')}` : '';

      const response = await fetch(`/api/restaurants?type=london${excludeParam}`);
      const { data, error } = await response.json();

      if (error) {
        console.error('[HomePage] Error fetching London restaurants:', error);
        throw new Error(error);
      }

      console.log('[HomePage] London restaurants fetched:', data?.length || 0);

      const formatted: FeaturedRestaurant[] = (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        likesCount: r.likes_count || 0,
        address: r.address,
        imageUrl: r.image_url || 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400',
      }));

      setLondonRestaurants(formatted);
    } catch (error) {
      console.error('Error fetching London restaurants:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
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

  const handleMobileSearchClick = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) {
      e.preventDefault();
      setShowMobileSearch(true);
    }
  };

  return (
    <>
      <MobileSearchModal
        open={showMobileSearch}
        onOpenChange={setShowMobileSearch}
        initialQuery={searchQuery}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <div className="min-h-screen">
        <div className="relative min-h-[500px] md:min-h-[600px]">
          <div className="absolute inset-0 z-0">
            <img
              src="/Nugget_home_hero_08.jpg"
              alt="Family dining together"
              className="w-full h-full object-cover md:object-center object-[center_-100px]"
            />
          </div>

          <div className="relative z-10">
            <Header />
          </div>

          <div className="relative z-20 container mx-auto px-4 pt-8 md:pt-16 pb-16 md:pb-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="space-y-4 mt-[120px] md:mt-0">
                <h1 className="text-[2.8125rem] sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-white tracking-tight font-serif drop-shadow-lg leading-[1] sm:leading-tight">
                  Find the perfect place to eat out with your family
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white max-w-2xl mx-auto drop-shadow-md mb-5">
                  Use natural language to find restaurants. Try searching for cuisine types, features like kids menus, or specific locations.
                </p>
              </div>

          <form onSubmit={handleSearch} className="max-w-5xl mx-auto mt-6 md:mt-10">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div ref={searchRef} className="relative flex-1 bg-white rounded-full shadow-lg z-50">
                <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-slate-400 z-10" />
                <Input
                  type="text"
                  placeholder={placeholderText}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={(e) => {
                    handleMobileSearchClick(e as any);
                    if (suggestions.length > 0 && window.innerWidth >= 768) {
                      setShowSuggestions(true);
                    }
                  }}
                  onClick={handleMobileSearchClick}
                  className="pl-12 sm:pl-16 h-14 sm:h-16 text-base sm:text-lg border-0 rounded-full focus-visible:ring-2 focus-visible:ring-slate-300"
                />
                {showSuggestions && suggestions.length > 0 && window.innerWidth >= 768 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 hidden md:block">
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
              <Button
                type="submit"
                size="lg"
                className="h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg rounded-full bg-[#8dbf65] hover:bg-[#7aaa56] text-white shadow-lg w-full sm:w-auto"
              >
                Search Restaurants
              </Button>
            </div>
          </form>
            </div>
          </div>
        </div>

        <main className="container mx-auto">
          <div className="max-w-full mx-auto space-y-8">
            <div className="mt-[-10px] md:mt-16 text-left px-4 md:px-10">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6">Featured restaurants with high chairs</h2>
            {featuredRestaurants.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {featuredRestaurants.map((restaurant) => (
                  <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} prefetch={false}>
                    <Card className="cursor-pointer transition-all hover:shadow-lg border-slate-200 overflow-hidden">
                      <div className="relative h-40 w-full overflow-hidden">
                        <img
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 flex items-center gap-2">
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
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm text-slate-900 mb-2 line-clamp-1">
                          {restaurant.name}
                        </h3>
                        {restaurant.likesCount > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                            <span className="text-xs font-medium text-slate-700">{restaurant.likesCount} likes</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-600 mb-1 line-clamp-1">{restaurant.cuisine}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{restaurant.address}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-12 md:mt-16 text-left px-4 md:px-10 py-10">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6">Featured restaurants in London</h2>
            {londonRestaurants.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {londonRestaurants.map((restaurant) => (
                  <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} prefetch={false}>
                    <Card className="cursor-pointer transition-all hover:shadow-lg border-slate-200 overflow-hidden">
                      <div className="relative h-40 w-full overflow-hidden">
                        <img
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 flex items-center gap-2">
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
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm text-slate-900 mb-2 line-clamp-1">
                          {restaurant.name}
                        </h3>
                        {restaurant.likesCount > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                            <span className="text-xs font-medium text-slate-700">{restaurant.likesCount} likes</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-600 mb-1 line-clamp-1">{restaurant.cuisine}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{restaurant.address}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
