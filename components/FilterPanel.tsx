'use client';

import { useState } from 'react';
import {
  Smile, Utensils, Car, Wifi, Volume2, Users, Accessibility, Trees,
  Baby, Droplets, Dog, Leaf, Wheat, Heart, Pizza, Clock,
  UtensilsCrossed, Sparkles, Music, PartyPopper, GlassWater, Gift,
  MapPin, DollarSign, Shirt, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterPanelProps {
  onFilterChange?: (filters: FilterState) => void;
  expanded?: boolean;
}

export interface FilterState {
  cuisines: string[];
  kidsMenu: boolean;
  highChairs: boolean;
  changingTable: boolean;
  wheelchairAccess: boolean;
  babyChangeWomens: boolean;
  babyChangeUnisex: boolean;
  babyChangeMens: boolean;
  kidsPottyToilet: boolean;
  pramStorage: boolean;
  outdoorSeating: boolean;
  playgroundNearby: boolean;
  airConditioning: boolean;
  dogFriendly: boolean;
  vegetarianOptions: boolean;
  veganOptions: boolean;
  glutenFreeOptions: boolean;
  smallPlates: boolean;
  healthyOptions: boolean;
  halal: boolean;
  kosher: boolean;
  funQuirky: boolean;
  relaxed: boolean;
  buzzy: boolean;
  posh: boolean;
  goodForGroups: boolean;
  kidsColoring: boolean;
  gamesAvailable: boolean;
  kidsPlaySpace: boolean;
  teenFavourite: boolean;
  quickService: boolean;
  friendlyStaff: boolean;
  takeaway: boolean;
  freeKidsMeal: boolean;
  onePoundKidsMeal: boolean;
  touristAttractionNearby: boolean;
}

export function FilterPanel({ onFilterChange, expanded = false }: FilterPanelProps) {
  const [activeFilters, setActiveFilters] = useState<FilterState>({
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

  const toggleFilter = (key: keyof Omit<FilterState, 'cuisines'>) => {
    const newFilters = {
      ...activeFilters,
      [key]: !activeFilters[key],
    };
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = activeFilters.cuisines.includes(cuisine)
      ? activeFilters.cuisines.filter(c => c !== cuisine)
      : [...activeFilters.cuisines, cuisine];

    const newFilters = {
      ...activeFilters,
      cuisines: newCuisines,
    };
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
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
    };
    setActiveFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const cuisineTypes = [
    'American', 'British', 'Chinese', 'Deli', 'European', 'Food Court',
    'French', 'Greek', 'Indian', 'International', 'Italian', 'Japanese',
    'Latin American', 'Mediterranean', 'Mexican', 'Middle Eastern',
    'Peruvian', 'Pizza', 'Spanish', 'Vietnamese'
  ];

  const filterCategories = [
    {
      title: 'Kids & Family',
      filters: [
        { key: 'kidsMenu' as keyof Omit<FilterState, 'cuisines'>, icon: Smile, label: 'Kids Menu' },
        { key: 'highChairs' as keyof Omit<FilterState, 'cuisines'>, icon: Utensils, label: 'High Chairs' },
        { key: 'changingTable' as keyof Omit<FilterState, 'cuisines'>, icon: Baby, label: 'Changing Table' },
        { key: 'babyChangeWomens' as keyof Omit<FilterState, 'cuisines'>, icon: Droplets, label: 'Baby Change (Women)' },
        { key: 'babyChangeUnisex' as keyof Omit<FilterState, 'cuisines'>, icon: Droplets, label: 'Baby Change (Unisex)' },
        { key: 'babyChangeMens' as keyof Omit<FilterState, 'cuisines'>, icon: Droplets, label: 'Baby Change (Men)' },
        { key: 'kidsPottyToilet' as keyof Omit<FilterState, 'cuisines'>, icon: Baby, label: 'Kids Potty/Toilet' },
        { key: 'pramStorage' as keyof Omit<FilterState, 'cuisines'>, icon: Car, label: 'Pram Storage' },
        { key: 'kidsColoring' as keyof Omit<FilterState, 'cuisines'>, icon: Sparkles, label: 'Kids Coloring' },
        { key: 'gamesAvailable' as keyof Omit<FilterState, 'cuisines'>, icon: PartyPopper, label: 'Games Available' },
        { key: 'kidsPlaySpace' as keyof Omit<FilterState, 'cuisines'>, icon: Users, label: 'Kids Play Space' },
        { key: 'teenFavourite' as keyof Omit<FilterState, 'cuisines'>, icon: Heart, label: 'Teen Favourite' },
        { key: 'playgroundNearby' as keyof Omit<FilterState, 'cuisines'>, icon: MapPin, label: 'Playground Nearby' },
      ]
    },
    {
      title: 'Accessibility',
      filters: [
        { key: 'wheelchairAccess' as keyof Omit<FilterState, 'cuisines'>, icon: Accessibility, label: 'Wheelchair Access' },
      ]
    },
    {
      title: 'Amenities',
      filters: [
        { key: 'outdoorSeating' as keyof Omit<FilterState, 'cuisines'>, icon: Trees, label: 'Outdoor Seating' },
        { key: 'airConditioning' as keyof Omit<FilterState, 'cuisines'>, icon: Wifi, label: 'Air Conditioning' },
        { key: 'dogFriendly' as keyof Omit<FilterState, 'cuisines'>, icon: Dog, label: 'Dog Friendly' },
        { key: 'touristAttractionNearby' as keyof Omit<FilterState, 'cuisines'>, icon: MapPin, label: 'Tourist Attraction' },
      ]
    },
    {
      title: 'Dietary',
      filters: [
        { key: 'vegetarianOptions' as keyof Omit<FilterState, 'cuisines'>, icon: Leaf, label: 'Vegetarian' },
        { key: 'veganOptions' as keyof Omit<FilterState, 'cuisines'>, icon: Leaf, label: 'Vegan' },
        { key: 'glutenFreeOptions' as keyof Omit<FilterState, 'cuisines'>, icon: Wheat, label: 'Gluten Free' },
        { key: 'halal' as keyof Omit<FilterState, 'cuisines'>, icon: UtensilsCrossed, label: 'Halal' },
        { key: 'kosher' as keyof Omit<FilterState, 'cuisines'>, icon: UtensilsCrossed, label: 'Kosher' },
        { key: 'smallPlates' as keyof Omit<FilterState, 'cuisines'>, icon: Pizza, label: 'Small Plates' },
        { key: 'healthyOptions' as keyof Omit<FilterState, 'cuisines'>, icon: Heart, label: 'Healthy Options' },
      ]
    },
    {
      title: 'Atmosphere',
      filters: [
        { key: 'funQuirky' as keyof Omit<FilterState, 'cuisines'>, icon: PartyPopper, label: 'Fun & Quirky' },
        { key: 'relaxed' as keyof Omit<FilterState, 'cuisines'>, icon: Volume2, label: 'Relaxed' },
        { key: 'buzzy' as keyof Omit<FilterState, 'cuisines'>, icon: Music, label: 'Buzzy' },
        { key: 'posh' as keyof Omit<FilterState, 'cuisines'>, icon: Sparkles, label: 'Posh' },
      ]
    },
    {
      title: 'Service',
      filters: [
        { key: 'quickService' as keyof Omit<FilterState, 'cuisines'>, icon: Clock, label: 'Quick Service' },
        { key: 'friendlyStaff' as keyof Omit<FilterState, 'cuisines'>, icon: Smile, label: 'Friendly Staff' },
        { key: 'goodForGroups' as keyof Omit<FilterState, 'cuisines'>, icon: Users, label: 'Good for Groups' },
        { key: 'takeaway' as keyof Omit<FilterState, 'cuisines'>, icon: UtensilsCrossed, label: 'Takeaway' },
      ]
    },
    {
      title: 'Deals',
      filters: [
        { key: 'freeKidsMeal' as keyof Omit<FilterState, 'cuisines'>, icon: Gift, label: 'Free Kids Meal' },
        { key: 'onePoundKidsMeal' as keyof Omit<FilterState, 'cuisines'>, icon: DollarSign, label: '£1 Kids Meal' },
      ]
    },
  ];

  const activeFilterCount = Object.entries(activeFilters).filter(([key, value]) => {
    if (key === 'cuisines') return value.length > 0;
    return value === true;
  }).length;

  if (expanded) {
    return (
      <ScrollArea className="h-full w-full">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900">Active Filters</h4>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="bg-[#8dbf65] text-white">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                Clear All
              </Button>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Cuisine Type</h4>
            <div className="flex flex-wrap gap-2">
              {cuisineTypes.map((cuisine) => (
                <Button
                  key={cuisine}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCuisine(cuisine)}
                  className={`transition-colors ${
                    activeFilters.cuisines.includes(cuisine)
                      ? 'bg-[#8dbf65] text-white border-[#8dbf65] hover:bg-[#7aaa56] hover:border-[#7aaa56]'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cuisine}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {filterCategories.map((category) => (
            <div key={category.title}>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">{category.title}</h4>
              <div className="grid grid-cols-2 gap-3">
                {category.filters.map(({ key, icon: Icon, label }) => (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() => toggleFilter(key)}
                    className={`h-20 flex flex-col items-center justify-center gap-2 transition-colors ${
                      activeFilters[key]
                        ? 'bg-[#8dbf65] text-white border-[#8dbf65] hover:bg-[#7aaa56] hover:border-[#7aaa56]'
                        : 'border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium text-center leading-tight">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  // Top filters to show in collapsed view
  const topFilters = [
    { key: 'kidsMenu' as keyof Omit<FilterState, 'cuisines'>, icon: Smile, label: 'Kids Menu' },
    { key: 'highChairs' as keyof Omit<FilterState, 'cuisines'>, icon: Utensils, label: 'High Chairs' },
    { key: 'wheelchairAccess' as keyof Omit<FilterState, 'cuisines'>, icon: Accessibility, label: 'Wheelchair' },
    { key: 'outdoorSeating' as keyof Omit<FilterState, 'cuisines'>, icon: Trees, label: 'Outdoor' },
    { key: 'dogFriendly' as keyof Omit<FilterState, 'cuisines'>, icon: Dog, label: 'Dog Friendly' },
    { key: 'vegetarianOptions' as keyof Omit<FilterState, 'cuisines'>, icon: Leaf, label: 'Vegetarian' },
    { key: 'veganOptions' as keyof Omit<FilterState, 'cuisines'>, icon: Leaf, label: 'Vegan' },
    { key: 'glutenFreeOptions' as keyof Omit<FilterState, 'cuisines'>, icon: Wheat, label: 'Gluten Free' },
  ];

  return (
    <div className="flex flex-col items-center h-full py-6">
      <div className="flex flex-col items-center gap-6">
        {topFilters.map(({ key, icon: Icon, label }) => (
          <Button
            key={key}
            variant="ghost"
            size="icon"
            onClick={() => toggleFilter(key)}
            className={`w-12 h-12 rounded-lg transition-colors relative ${
              activeFilters[key]
                ? 'bg-[#8dbf65] text-white hover:bg-[#7aaa56]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={label}
          >
            <Icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
    </div>
  );
}
