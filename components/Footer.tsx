'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

export function Footer() {
  const { userProfile } = useAuth();
  const isOwner = userProfile?.role === 'owner' || userProfile?.role === 'admin';
  const restaurantPartnerLink = isOwner ? '/owner/dashboard' : '/partner';
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('city')
        .eq('visible', true)
        .not('city', 'is', null);

      if (error) throw error;

      const citySet = new Set(
        data?.map(r => r.city?.trim()).filter(Boolean).map(city => city.toLowerCase())
      );
      const uniqueCities = Array.from(citySet).map(city => {
        const original = data?.find(r => r.city?.trim().toLowerCase() === city);
        return original?.city?.trim() || city;
      }) as string[];
      setCities(uniqueCities.sort().slice(0, 5));
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  return (
    <footer className="bg-[#dfe9d3] border-t border-slate-200">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Our mission is to make dining out easier and more fun for families.
            </h2>
            <div className="space-y-2 text-slate-700">
              <p>Helping families find welcoming places faster.</p>
              <p>Helping cities and businesses see who's included and who's left out.</p>
            </div>
          </div>

          <div className="md:border-l md:border-slate-300 md:pl-8">
            <h3 className="font-semibold text-lg mb-4 text-slate-900">Cities we are in</h3>
            <ul className="space-y-3 text-slate-700">
              {cities.length > 0 ? (
                cities.map((city, index) => (
                  <li key={index}>
                    <Link
                      href={`/search?location=${encodeURIComponent(city)}`}
                      className="hover:text-slate-900 transition-colors"
                    >
                      {city}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">Loading cities...</li>
              )}
            </ul>
          </div>

          <div className="md:border-l md:border-slate-300 md:pl-8">
            <h3 className="font-semibold text-lg mb-4 text-slate-900">Quick Links</h3>
            <ul className="space-y-3 text-slate-700">
              <li>
                <Link href={restaurantPartnerLink} className="hover:text-slate-900 transition-colors">
                  Restaurant Partner
                </Link>
              </li>
              <li>
                <Link href="/local-hero" className="hover:text-slate-900 transition-colors">
                  Local Heroes
                </Link>
              </li>
              <li>
                <Link href="/suggest" className="hover:text-slate-900 transition-colors">
                  Suggest a Restaurant
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-slate-900 transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:border-l md:border-slate-300 md:pl-8">
            <h3 className="font-semibold text-lg mb-4 text-slate-900">Company</h3>
            <ul className="space-y-3 text-slate-700">
              <li>
                <Link href="/about" className="hover:text-slate-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-900 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition-colors flex items-center gap-2"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-300 text-center text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} Nugget. All rights reserved - s  
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </Link>
            <span> - </span>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
