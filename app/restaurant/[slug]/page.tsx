import { Metadata } from 'next';
import RestaurantDetail from '@/components/RestaurantDetail';
import { supabase } from '@/lib/supabase/client';

export async function generateStaticParams() {
  const { data } = await supabase
    .from('restaurants')
    .select('id')
    .eq('visible', true);

  return (data || []).map((restaurant) => ({
    slug: restaurant.id,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', params.slug)
    .eq('visible', true)
    .maybeSingle();

  if (!restaurant) {
    return {
      title: 'Restaurant Not Found',
      description: 'The restaurant you are looking for could not be found.',
    };
  }

  const priceSymbol = '$'.repeat(restaurant.price_level || 2);
  const imageUrl = restaurant.image_url || 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400';

  return {
    title: `${restaurant.name} - ${restaurant.cuisine}`,
    description: `${restaurant.name} in ${restaurant.address}. ${restaurant.likes_count || 0} likes. ${restaurant.family_friendly ? 'Family-friendly restaurant' : 'Restaurant'} serving ${restaurant.cuisine}. ${priceSymbol} price level.`,
    keywords: [
      restaurant.name,
      restaurant.cuisine,
      'restaurant',
      restaurant.family_friendly ? 'family-friendly' : '',
      restaurant.kids_menu ? 'kids menu' : '',
      restaurant.address,
    ].filter(Boolean),
    alternates: {
      canonical: `/restaurant/${restaurant.id}`,
    },
    openGraph: {
      title: `${restaurant.name} | MapSearch`,
      description: `${restaurant.name} - ${restaurant.cuisine}. ${restaurant.likes_count || 0} likes.`,
      url: `https://yourdomain.com/restaurant/${restaurant.id}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: restaurant.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${restaurant.name} | MapSearch`,
      description: `${restaurant.name} - ${restaurant.cuisine}. ${restaurant.likes_count || 0} likes`,
      images: [imageUrl],
    },
  };
}

export default function RestaurantDetailPage({ params }: { params: { slug: string } }) {
  return <RestaurantDetail slug={params.slug} />;
}
