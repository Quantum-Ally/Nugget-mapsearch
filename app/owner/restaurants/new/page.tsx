'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import BasicInfoTab from '@/components/owner/restaurant-form/BasicInfoTab';
import LocationTab from '@/components/owner/restaurant-form/LocationTab';
import OpeningHoursTab from '@/components/owner/restaurant-form/OpeningHoursTab';
import AmenitiesTab from '@/components/owner/restaurant-form/AmenitiesTab';

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

export interface RestaurantFormData {
  name: string;
  cuisine: string;
  description: string;
  phone: string;
  price_level: number;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  image_url: string;
  website_url: string;
  google_maps_url: string;
  opening_times: OpeningTimes;
  family_friendly: boolean;
  kids_menu: boolean;
  high_chairs: boolean;
  wheelchair_access: boolean;
  outdoor_seating: boolean;
  changing_table: boolean;
  vegetarian_options: boolean;
  vegan_options: boolean;
  gluten_free_options: boolean;
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
}

const initialFormData: RestaurantFormData = {
  name: '',
  cuisine: '',
  description: '',
  phone: '',
  price_level: 2,
  address: '',
  city: '',
  country: 'United Kingdom',
  latitude: 0,
  longitude: 0,
  image_url: '',
  website_url: '',
  google_maps_url: '',
  opening_times: {},
  family_friendly: false,
  kids_menu: false,
  high_chairs: false,
  wheelchair_access: false,
  outdoor_seating: false,
  changing_table: false,
  vegetarian_options: false,
  vegan_options: false,
  gluten_free_options: false,
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
};

export default function AddRestaurantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<RestaurantFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Restaurant name is required');
    }
    if (!formData.cuisine.trim()) {
      errors.push('Cuisine type is required');
    }
    if (!formData.address.trim()) {
      errors.push('Address is required');
    }
    if (!formData.city.trim()) {
      errors.push('City is required');
    }
    if (formData.latitude === 0 || formData.longitude === 0) {
      errors.push('Please set the restaurant location on the map (Location tab)');
    }

    return errors;
  };

  const handleSave = async (publish: boolean) => {
    console.log('[DEBUG] handleSave called with publish:', publish);
    console.log('[DEBUG] Current user:', user);
    console.log('[DEBUG] User ID:', user?.id);
    console.log('[DEBUG] Form data:', formData);

    const errors = validateForm();
    console.log('[DEBUG] Validation errors:', errors);

    if (errors.length > 0) {
      setValidationErrors(errors);
      setValidationDialogOpen(true);
      return;
    }

    if (!user) {
      console.error('[DEBUG] No user found!');
      toast({
        title: 'Error',
        description: 'You must be logged in to create a restaurant',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    console.log('[DEBUG] Starting save process...');

    try {
      // Check Supabase client
      console.log('[DEBUG] Supabase client check:', {
        hasSupabase: !!supabase,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      });

      // Check auth session with timeout
      console.log('[DEBUG] About to check session...');
      let sessionData, sessionError;
      
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout after 5 seconds')), 5000)
        );
        
        const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
        sessionData = result.data;
        sessionError = result.error;
      } catch (timeoutError: any) {
        console.error('[DEBUG] Session check timed out or failed:', timeoutError);
        // Continue anyway - we already have user from AuthContext
        sessionData = { session: null };
        sessionError = timeoutError;
      }

      console.log('[DEBUG] Session check completed:', {
        hasSession: !!sessionData?.session,
        sessionError: sessionError?.message,
        userId: sessionData?.session?.user?.id,
      });

      // Don't block on session check - we already have user from AuthContext
      // Only warn if there's a critical error
      if (sessionError && !sessionError.message.includes('timeout')) {
        console.warn('[DEBUG] Session check warning:', sessionError.message);
      }

      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const dataToSave = {
        ...formData,
        slug,
        visible: publish,
        city: formData.city.trim() || null,
        country: formData.country.trim() || null,
        phone: formData.phone.trim() || null,
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        website_url: formData.website_url.trim() || null,
        google_maps_url: formData.google_maps_url.trim() || null,
        opening_times: formData.opening_times || {},
      };

      // Validate required fields
      const requiredFields = ['name', 'slug', 'cuisine', 'address', 'latitude', 'longitude'];
      const missingFields = requiredFields.filter(field => !dataToSave[field as keyof typeof dataToSave]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Handle large base64 images - truncate for logging
      const dataToLog = { ...dataToSave };
      if (dataToLog.image_url && dataToLog.image_url.startsWith('data:')) {
        dataToLog.image_url = `[BASE64_IMAGE_${dataToLog.image_url.length}_chars]`;
      }
      
      console.log('[DEBUG] Data to save:', JSON.stringify(dataToLog, null, 2));
      console.log('[DEBUG] Data keys:', Object.keys(dataToSave));
      console.log('[DEBUG] Image URL length:', dataToSave.image_url?.length || 0);
      
      // Test direct network connection to Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      console.log('[DEBUG] Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING');
      
      if (!supabaseUrl) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
      }

      // Test direct fetch to Supabase REST API
      console.log('[DEBUG] Testing direct network connection to Supabase...');
      try {
        const testUrl = `${supabaseUrl}/rest/v1/restaurants?select=id&limit=1`;
        const testHeaders = {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'Content-Type': 'application/json',
        };
        
        console.log('[DEBUG] Test URL:', testUrl);
        console.log('[DEBUG] Test headers:', { ...testHeaders, apikey: testHeaders.apikey ? 'SET' : 'MISSING' });
        
        const fetchPromise = fetch(testUrl, {
          method: 'GET',
          headers: testHeaders,
          signal: AbortSignal.timeout(5000),
        });

        const fetchResult = await fetchPromise;
        console.log('[DEBUG] Direct fetch result:', {
          status: fetchResult.status,
          statusText: fetchResult.statusText,
          ok: fetchResult.ok,
        });
        
        if (!fetchResult.ok) {
          const errorText = await fetchResult.text();
          console.error('[DEBUG] Fetch error response:', errorText);
          throw new Error(`Supabase returned ${fetchResult.status}: ${errorText.substring(0, 100)}`);
        }
        
        const testData = await fetchResult.json();
        console.log('[DEBUG] Direct fetch success, data:', testData);
      } catch (fetchError: any) {
        console.error('[DEBUG] Direct fetch test failed:', fetchError.message);
        console.error('[DEBUG] This means network requests to Supabase are being blocked or failing');
        console.error('[DEBUG] Check: 1) Network tab for blocked requests, 2) CSP headers, 3) Supabase URL validity');
        // Don't throw - try Supabase client anyway
      }

      // Test Supabase client query
      console.log('[DEBUG] Testing Supabase client query...');
      try {
        const testQuery = await Promise.race([
          supabase.from('restaurants').select('id').limit(1),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Client query timeout')), 5000))
        ]) as any;
        console.log('[DEBUG] Client query result:', { 
          success: !testQuery.error, 
          error: testQuery.error?.message,
          dataCount: testQuery.data?.length || 0,
        });
      } catch (testError: any) {
        console.error('[DEBUG] Client query test failed:', testError.message);
        // Continue anyway - maybe insert will work
      }

      console.log('[DEBUG] About to call Supabase insert...');

      const insertStartTime = Date.now();
      console.log('[DEBUG] Insert start time:', insertStartTime);

      // Remove base64 image if it's too large (Supabase has limits)
      const dataToInsert = { ...dataToSave };
      if (dataToInsert.image_url && dataToInsert.image_url.startsWith('data:') && dataToInsert.image_url.length > 100000) {
        console.warn('[DEBUG] Image URL too large, removing for now:', dataToInsert.image_url.length, 'chars');
        dataToInsert.image_url = null;
      }

      // Use API route to handle insert server-side (avoids RLS and client timeout issues)
      console.log('[DEBUG] Using API route for insert (server-side handles auth properly)...');
      let restaurant, restaurantError;
      
      try {
        const apiResponse = await fetch('/api/restaurants/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            restaurantData: dataToInsert,
            ownershipData: {
              owner_id: user.id,
              is_primary_owner: true,
              verified: true,
            },
            analyticsData: {
          date: new Date().toISOString().split('T')[0],
          views: 0,
            },
          }),
          signal: AbortSignal.timeout(30000),
        });
        
        console.log('[DEBUG] API response status:', apiResponse.status);
        
        const apiResult = await apiResponse.json();

        if (!apiResponse.ok) {
          console.error('[DEBUG] API error response:', apiResult);
          restaurantError = {
            message: apiResult.message || `API error: ${apiResponse.status}`,
            code: apiResponse.status.toString(),
          };
          restaurant = null;
        } else {
          console.log('[DEBUG] API success, restaurant:', apiResult.restaurant);
          restaurant = apiResult.restaurant;
          restaurantError = null;
        }
      } catch (fetchError: any) {
        console.error('[DEBUG] API request failed:', fetchError.message);
        restaurantError = fetchError;
        restaurant = null;
      }

      const insertEndTime = Date.now();
      console.log('[DEBUG] Insert completed in:', insertEndTime - insertStartTime, 'ms');
      console.log('[DEBUG] Insert response:', { 
        hasData: !!restaurant, 
        hasError: !!restaurantError,
        errorMessage: restaurantError?.message,
        errorCode: restaurantError?.code,
      });

      if (restaurantError) {
        console.error('[DEBUG] Restaurant insert error:', restaurantError);
        console.error('[DEBUG] Error details:', {
          message: restaurantError.message,
          details: restaurantError.details,
          hint: restaurantError.hint,
          code: restaurantError.code,
        });
        throw restaurantError;
      }

      console.log('[DEBUG] Restaurant created successfully:', restaurant);
      // Ownership and analytics are handled by the API route

      console.log('Restaurant saved successfully, redirecting...');

      toast({
        title: 'Success',
        description: `Restaurant ${publish ? 'published' : 'saved as draft'} successfully`,
      });

      router.push('/owner/restaurants');
    } catch (error: any) {
      console.error('[DEBUG] Error saving restaurant:', error);
      console.error('[DEBUG] Error stack:', error.stack);
      console.error('[DEBUG] Error type:', error?.constructor?.name);
      console.error('[DEBUG] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      let errorMessage = 'Failed to save restaurant';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code) {
        errorMessage = `Database error (${error.code}): ${error.message || 'Unknown error'}`;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      console.log('[DEBUG] Finally block - setting saving to false');
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/owner/restaurants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Add New Restaurant</h1>
            <p className="text-slate-600 mt-1">Fill in the details to list your restaurant</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
          <CardDescription>
            Complete all sections to create a detailed listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="hours">Opening Hours</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <BasicInfoTab formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              <LocationTab formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="hours" className="space-y-6">
              <OpeningHoursTab formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="amenities" className="space-y-6">
              <AmenitiesTab formData={formData} setFormData={setFormData} />
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex-1 bg-[#8dbf65] hover:bg-[#7aaa56]"
            >
              <Eye className="mr-2 h-4 w-4" />
              {saving ? 'Publishing...' : 'Publish Restaurant'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Missing Required Information
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Please complete the following required fields before publishing:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setValidationDialogOpen(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
