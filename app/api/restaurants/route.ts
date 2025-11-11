import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseNaturalLanguageQuery } from '@/lib/natural-language-search';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function applyFilters(initialQuery: any, searchParams: URLSearchParams) {
  // Map filter names to database column names
  const columnMap: Record<string, string> = {
    kidsMenu: 'kids_menu',
    highChairs: 'high_chairs',
    changingTable: 'changing_table',
    wheelchairAccess: 'wheelchair_access',
    babyChangeWomens: 'baby_change_womens',
    babyChangeUnisex: 'baby_change_unisex',
    babyChangeMens: 'baby_change_mens',
    kidsPottyToilet: 'kids_potty_toilet',
    pramStorage: 'pram_storage',
    outdoorSeating: 'outdoor_seating',
    playgroundNearby: 'playground_nearby',
    airConditioning: 'air_conditioning',
    dogFriendly: 'dog_friendly',
    vegetarianOptions: 'vegetarian_options',
    veganOptions: 'vegan_options',
    glutenFreeOptions: 'gluten_free_options',
    smallPlates: 'small_plates',
    healthyOptions: 'healthy_options',
    halal: 'halal',
    kosher: 'kosher',
    funQuirky: 'fun_quirky',
    relaxed: 'relaxed',
    buzzy: 'buzzy',
    posh: 'posh',
    goodForGroups: 'good_for_groups',
    kidsColoring: 'kids_coloring',
    gamesAvailable: 'games_available',
    kidsPlaySpace: 'kids_play_space',
    teenFavourite: 'teen_favourite',
    quickService: 'quick_service',
    friendlyStaff: 'friendly_staff',
    takeaway: 'takeaway',
    freeKidsMeal: 'free_kids_meal',
    onePoundKidsMeal: 'one_pound_kids_meal',
    touristAttractionNearby: 'tourist_attraction_nearby',
  };

  // Apply boolean filters
  for (const [filterKey, dbColumn] of Object.entries(columnMap)) {
    if (searchParams.get(filterKey) === 'true') {
      initialQuery = initialQuery.eq(dbColumn, true);
    }
  }

  // Handle cuisine filters separately
  const cuisines = searchParams.get('cuisines');
  if (cuisines) {
    const cuisineList = cuisines.split(',');

    // If we have cuisine filters, we need to fetch all results first and filter in memory
    // to avoid conflicts with OR conditions
    const { data, error } = await initialQuery;

    if (error) throw error;

    // Filter by cuisines in memory
    const filteredData = data.filter((restaurant: any) => {
      return cuisineList.some(cuisine =>
        restaurant.cuisine?.toLowerCase().includes(cuisine.trim().toLowerCase())
      );
    });

    return { data: filteredData, isFiltered: true };
  }

  return { query: initialQuery, isFiltered: false };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const query = searchParams.get('q');

  try {
    if (type === 'featured') {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, cuisine, likes_count, address, image_url')
        .eq('visible', true)
        .eq('high_chairs', true)
        .order('likes_count', { ascending: false })
        .limit(5);

      if (error) throw error;

      return NextResponse.json({ data, error: null });
    }

    if (type === 'london') {
      const excludeIds = searchParams.get('exclude')?.split(',') || [];

      let supabaseQuery = supabase
        .from('restaurants')
        .select('id, name, cuisine, likes_count, address, image_url')
        .eq('visible', true)
        .ilike('address', '%London%');

      if (excludeIds.length > 0) {
        supabaseQuery = supabaseQuery.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data, error } = await supabaseQuery
        .order('likes_count', { ascending: false })
        .limit(5);

      if (error) throw error;

      return NextResponse.json({ data, error: null });
    }

    if (type === 'search') {
      const searchTerm = `%${query?.toLowerCase() || ''}%`;

      // Parse natural language query
      const parsed = query ? parseNaturalLanguageQuery(query) : null;

      console.log('Natural language parse result:', JSON.stringify(parsed, null, 2));

      // Check if there's a location in the parsed query or in the original query
      const locationToCheck = parsed?.location || query?.toLowerCase();

      const cityCheckResult = await supabase
        .from('restaurants')
        .select('city')
        .eq('visible', true)
        .not('city', 'is', null)
        .neq('city', '')
        .ilike('city', `%${locationToCheck}%`)
        .limit(1);

      const isExactCityMatch = cityCheckResult.data && cityCheckResult.data.length > 0;
      let cityCoordinates = null;
      let matchedCity = null;

      if (isExactCityMatch && (parsed?.location || query)) {
        matchedCity = cityCheckResult.data[0].city;

        // Use parsed location for geocoding if available, otherwise use query
        const geocodeQuery = parsed?.location || query;

        try {
          const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
          if (mapboxToken) {
            const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(geocodeQuery!)}.json?access_token=${mapboxToken}&limit=1&types=place`;
            const geocodeResponse = await fetch(geocodeUrl);

            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json();
              if (geocodeData.features && geocodeData.features.length > 0) {
                cityCoordinates = geocodeData.features[0].center;
              }
            }
          }
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError);
        }
      }

      let supabaseQuery = supabase
        .from('restaurants')
        .select('*')
        .eq('visible', true);

      // Apply feature filters from natural language parsing
      if (parsed?.features) {
        Object.entries(parsed.features).forEach(([feature, value]) => {
          if (value === true) {
            // Map feature names to database column names
            const columnMap: Record<string, string> = {
              kidsMenu: 'kids_menu',
              highChairs: 'high_chairs',
              changingTable: 'changing_table',
              wheelchairAccess: 'wheelchair_access',
              outdoorSeating: 'outdoor_seating',
              vegetarianOptions: 'vegetarian_options',
              veganOptions: 'vegan_options',
              glutenFree: 'gluten_free_options',
              halal: 'halal',
              kosher: 'kosher',
              dogFriendly: 'dog_friendly',
              takeaway: 'takeaway',
              quickService: 'quick_service',
              goodForGroups: 'good_for_groups',
              freeKidsMeal: 'free_kids_meal',
              playgroundNearby: 'playground_nearby',
              airConditioning: 'air_conditioning',
              kidsPlaySpace: 'kids_play_space',
              kidsColoring: 'kids_coloring',
              gamesAvailable: 'games_available',
              healthyOptions: 'healthy_options',
              smallPlates: 'small_plates',
              buzzy: 'buzzy',
              relaxed: 'relaxed',
              posh: 'posh',
              funQuirky: 'fun_quirky',
              babyChangeWomens: 'baby_change_womens',
              babyChangeMens: 'baby_change_mens',
              babyChangeUnisex: 'baby_change_unisex',
              pramStorage: 'pram_storage'
            };
            const dbColumn = columnMap[feature] || feature;
            supabaseQuery = supabaseQuery.eq(dbColumn, true);
          }
        });
      }

      // Apply price level filter
      if (parsed?.priceLevel) {
        supabaseQuery = supabaseQuery.eq('price_level', parsed.priceLevel);
      }

      // Apply cuisine filters
      if (parsed?.cuisines && parsed.cuisines.length > 0) {
        const cuisineConditions = parsed.cuisines
          .map(c => `cuisine.ilike.%${c}%`)
          .join(',');
        supabaseQuery = supabaseQuery.or(cuisineConditions);
      }

      if (isExactCityMatch && cityCoordinates) {
        const [lng, lat] = cityCoordinates;
        const radiusMiles = 20;
        const radiusMeters = radiusMiles * 1609.34;

        // Apply user-selected filters before executing
        const filterResult = await applyFilters(supabaseQuery, searchParams);

        let allData;
        if (filterResult.isFiltered) {
          allData = filterResult.data;
        } else {
          const { data, error: allError } = await filterResult.query.order('rating', { ascending: false });
          if (allError) throw allError;
          allData = data;
        }

        const filteredData = (allData || []).filter((restaurant: any) => {
          if (!restaurant.latitude || !restaurant.longitude) return false;

          const distance = calculateDistance(
            lat,
            lng,
            restaurant.latitude,
            restaurant.longitude
          );

          return distance <= radiusMeters;
        });

        filteredData.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));

        return NextResponse.json({
          data: filteredData,
          error: null,
          city: matchedCity,
          cityCoordinates
        });
      } else if (isExactCityMatch) {
        const cityName = cityCheckResult.data[0].city;
        supabaseQuery = supabaseQuery.ilike('city', cityName);
      } else if (parsed?.location) {
        // Apply location filter from natural language parsing
        supabaseQuery = supabaseQuery.or(`city.ilike.%${parsed.location}%,address.ilike.%${parsed.location}%`);
      } else if (!parsed?.cuisines?.length && !Object.keys(parsed?.features || {}).length) {
        // Only do generic search if no specific features or cuisines were found
        supabaseQuery = supabaseQuery.or(`name.ilike.${searchTerm},cuisine.ilike.${searchTerm},address.ilike.${searchTerm},city.ilike.${searchTerm}`);
      }

      // Apply user-selected filters at the end
      const filterResult = await applyFilters(supabaseQuery, searchParams);

      if (filterResult.isFiltered) {
        const sortedData = filterResult.data.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        return NextResponse.json({ data: sortedData, error: null, city: matchedCity, cityCoordinates });
      } else {
        const { data, error } = await filterResult.query.order('rating', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ data, error: null, city: matchedCity, cityCoordinates });
      }
    }

    if (type === 'all') {
      let supabaseQuery = supabase
        .from('restaurants')
        .select('*')
        .eq('visible', true);

      // Apply filters
      const filterResult = await applyFilters(supabaseQuery, searchParams);

      if (filterResult.isFiltered) {
        // Data was filtered in memory (cuisines were involved), need to sort
        const sortedData = filterResult.data.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        return NextResponse.json({ data: sortedData, error: null });
      } else {
        // Use the query object and add ordering
        const { data, error } = await filterResult.query.order('rating', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ data, error: null });
      }
    }

    if (type === 'suggestions') {
      const searchTerm = `%${query?.toLowerCase() || ''}%`;

      const [restaurantsResult, citiesResult] = await Promise.all([
        supabase
          .from('restaurants')
          .select('id, name, cuisine, address, city')
          .eq('visible', true)
          .or(`name.ilike.${searchTerm},cuisine.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .order('rating', { ascending: false })
          .limit(5),
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
          .map(city => city!.charAt(0).toUpperCase() + city!.slice(1).toLowerCase())
      ));

      const citySuggestions = uniqueCities.map(city => ({
        id: city,
        name: city,
        cuisine: '',
        address: '',
        type: 'city' as const
      }));

      const restaurantSuggestions = (restaurantsResult.data || []).map(r => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        address: r.address,
        type: 'restaurant' as const
      }));

      const allSuggestions = [...citySuggestions, ...restaurantSuggestions].slice(0, 8);

      return NextResponse.json({ data: allSuggestions, error: null });
    }

    return NextResponse.json({ data: [], error: null });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}
