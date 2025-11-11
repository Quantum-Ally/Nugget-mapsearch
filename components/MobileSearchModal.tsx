'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, ArrowLeft, X, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface SearchSuggestion {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  imageUrl?: string;
  type: 'restaurant' | 'city';
}

interface MobileSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

export function MobileSearchModal({ open, onOpenChange, initialQuery = '' }: MobileSearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [quickSearches, setQuickSearches] = useState<string[]>([
    'pizza',
    'London',
    'Greek',
    'restaurants near me',
  ]);

  useEffect(() => {
    if (open) {
      setSearchQuery(initialQuery);
      if (initialQuery.trim().length > 1) {
        fetchSuggestions(initialQuery);
      }
    }
  }, [open, initialQuery]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const debounce = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;

      const [restaurantsResult, citiesResult] = await Promise.all([
        supabase
          .from('restaurants')
          .select('id, name, cuisine, address, image_url, city')
          .eq('visible', true)
          .or(`name.ilike.${searchTerm},cuisine.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .order('rating', { ascending: false })
          .limit(8),
        supabase
          .from('restaurants')
          .select('city')
          .eq('visible', true)
          .not('city', 'is', null)
          .neq('city', '')
          .ilike('city', searchTerm)
          .limit(5)
      ]);

      if (restaurantsResult.error) throw restaurantsResult.error;
      if (citiesResult.error) throw citiesResult.error;

      const uniqueCities = Array.from(new Set(
        (citiesResult.data || [])
          .map(r => r.city)
          .filter(Boolean)
          .map(city => city.charAt(0).toUpperCase() + city.slice(1).toLowerCase())
      ));

      const citySuggestions: SearchSuggestion[] = uniqueCities.map(city => ({
        id: city,
        name: city,
        cuisine: '',
        address: '',
        type: 'city' as const
      }));

      const restaurantSuggestions: SearchSuggestion[] = (restaurantsResult.data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        address: r.address,
        imageUrl: r.image_url || 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400',
        type: 'restaurant' as const
      }));

      const allSuggestions = [...citySuggestions, ...restaurantSuggestions].slice(0, 10);
      setSuggestions(allSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      onOpenChange(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleQuickSearch = (search: string) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  const handleRestaurantClick = (restaurantId: string) => {
    onOpenChange(false);
    router.push(`/restaurant/${restaurantId}`);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onOpenChange(false);
    if (suggestion.type === 'city') {
      router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
    } else {
      router.push(`/restaurant/${suggestion.id}`);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="fixed inset-0 z-50 w-full h-full bg-white md:hidden focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
          <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-10 w-10 p-0"
            >
              <ArrowLeft className="h-6 w-6 text-slate-700" />
            </Button>

            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
              <Input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                }}
                autoFocus
                className="pl-12 pr-12 h-12 text-base border-slate-300 rounded-full focus-visible:ring-2 focus-visible:ring-slate-300"
              />
              {searchQuery && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-slate-200 rounded-full hover:bg-slate-300"
                >
                  <X className="h-4 w-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!searchQuery.trim() && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Searches</h3>
                <div className="space-y-2">
                  {quickSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleQuickSearch(search)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      <span className="text-base text-slate-900">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.trim() && suggestions.length === 0 && (
              <div className="p-4">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
                  <p className="text-sm text-slate-500">
                    Try searching for a different restaurant, cuisine, or location
                  </p>
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  {suggestions.length} {suggestions.length === 1 ? 'result' : 'results'}
                </h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.id}-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      {suggestion.type === 'city' ? (
                        <>
                          <div className="w-14 h-14 rounded-lg flex-shrink-0 bg-[#8dbf65] flex items-center justify-center">
                            <Globe className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-semibold text-base text-slate-900 truncate">
                              {suggestion.name}
                            </div>
                            <div className="text-sm text-slate-600">
                              Search all restaurants in this city
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                            <img
                              src={suggestion.imageUrl}
                              alt={suggestion.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-semibold text-base text-slate-900 truncate">
                              {suggestion.name}
                            </div>
                            <div className="text-sm text-slate-600 truncate">
                              {suggestion.cuisine}
                            </div>
                            <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {suggestion.address}
                            </div>
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
