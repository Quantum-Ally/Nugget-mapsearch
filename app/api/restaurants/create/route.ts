import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to create a restaurant' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { restaurantData, ownershipData, analyticsData } = body;

    // Validate required fields
    if (!restaurantData.name || !restaurantData.cuisine || !restaurantData.address || 
        !restaurantData.city || !restaurantData.latitude || !restaurantData.longitude) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert([restaurantData])
      .select()
      .single();

    if (restaurantError) {
      console.error('Restaurant insert error:', restaurantError);
      return NextResponse.json(
        { error: 'Database error', message: restaurantError.message, code: restaurantError.code },
        { status: 500 }
      );
    }

    // Insert ownership
    if (ownershipData && restaurant) {
      const { error: ownershipError } = await supabase
        .from('restaurant_ownership')
        .insert({
          ...ownershipData,
          restaurant_id: restaurant.id,
        });

      if (ownershipError) {
        console.error('Ownership insert error:', ownershipError);
        // Don't fail - ownership is important but we can retry
      }
    }

    // Insert analytics
    if (analyticsData && restaurant) {
      const { error: analyticsError } = await supabase
        .from('restaurant_analytics')
        .insert({
          ...analyticsData,
          restaurant_id: restaurant.id,
        });

      if (analyticsError) {
        console.error('Analytics insert error:', analyticsError);
        // Don't fail - analytics is optional
      }
    }

    return NextResponse.json({ 
      success: true, 
      restaurant 
    });
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}


