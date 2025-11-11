import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { ConditionalFooter } from '@/components/ConditionalFooter';

export const metadata: Metadata = {
  metadataBase: new URL('https://yourdomain.com'),
  title: {
    default: 'MapSearch - Find Family-Friendly Restaurants',
    template: '%s | MapSearch',
  },
  description: 'Discover family-friendly restaurants with interactive maps, detailed reviews, and filters for kids menus, high chairs, parking, and more.',
  keywords: ['restaurants', 'family-friendly', 'kids menu', 'map search', 'restaurant finder', 'dining', 'food'],
  authors: [{ name: 'MapSearch Team' }],
  creator: 'MapSearch',
  publisher: 'MapSearch',
  icons: {
    icon: '/fav_icon.png',
    shortcut: '/fav_icon.png',
    apple: '/fav_icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    title: 'MapSearch - Find Family-Friendly Restaurants',
    description: 'Discover family-friendly restaurants with interactive maps, detailed reviews, and filters for kids menus, high chairs, parking, and more.',
    siteName: 'MapSearch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MapSearch - Find Family-Friendly Restaurants',
    description: 'Discover family-friendly restaurants with interactive maps, detailed reviews, and filters for kids menus, high chairs, parking, and more.',
    creator: '@mapsearch',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <ConditionalFooter />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
