'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import {
  Store,
  Users,
  TrendingUp,
  Clock,
  Camera,
  BarChart3,
  Gift,
  Target,
  CheckCircle2,
  ArrowRight,
  Star,
  MapPin,
  Heart
} from 'lucide-react';

export default function RestaurantPartnerPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative min-h-[400px] md:min-h-[500px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/resturant_partner copy.jpg"
            alt="Restaurant owner managing operations"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10">
          <Header />
        </div>

        <div className="relative z-20 container mx-auto px-4 pt-8 md:pt-16 pb-16 md:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-[2.25rem] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extralight font-serif text-white mb-6 leading-[0.924] sm:leading-tight drop-shadow-lg">
              Connect with families looking for kid-friendly dining
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-8 leading-relaxed drop-shadow-md">
              Join Nugget and reach thousands of families actively searching for welcoming restaurants. Free to start, easy to manage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/owner/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#8dbf65] hover:bg-[#7aaa56] h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/login?redirect=/owner/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-slate-300">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs sm:text-sm text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>5-Min Setup</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4">
              Why Partner With Nugget?
            </h2>
            <p className="text-center text-slate-600 text-base sm:text-lg mb-8 md:mb-12 max-w-2xl mx-auto">
              We help family-friendly restaurants like yours get discovered by the customers who value what you offer most.
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#8dbf65]/10 rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-[#8dbf65]" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Reach Your Ideal Customers
                  </h3>
                  <p className="text-slate-600">
                    Connect with families actively searching for kid-friendly dining options in your area. Our platform matches your amenities with their needs.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#8dbf65]/10 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-[#8dbf65]" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Increase Visibility
                  </h3>
                  <p className="text-slate-600">
                    Stand out in search results based on your family-friendly features. The more you offer, the more you're discovered.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#8dbf65]/10 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-[#8dbf65]" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Track Your Impact
                  </h3>
                  <p className="text-slate-600">
                    Monitor views, favorites, and engagement with detailed analytics. Understand what families love about your restaurant.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-slate-900 mb-8 md:mb-12">
              Everything You Need to Succeed
            </h2>

            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Complete Restaurant Profiles
                  </h3>
                  <p className="text-slate-600">
                    Showcase your menu, hours, amenities, and what makes your restaurant perfect for families.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Photo Gallery
                  </h3>
                  <p className="text-slate-600">
                    Upload up to 5 photos for free. Show off your space, food, and family-friendly atmosphere.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Real-Time Updates
                  </h3>
                  <p className="text-slate-600">
                    Update your hours, menu, and availability instantly. Keep customers informed with accurate information.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Promote Special Offers
                  </h3>
                  <p className="text-slate-600">
                    Create coupons and special offers to attract more family diners during off-peak hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Targeted Discovery
                  </h3>
                  <p className="text-slate-600">
                    Get found by families searching for specific amenities like high chairs, changing tables, or kids menus.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Build Loyalty
                  </h3>
                  <p className="text-slate-600">
                    Families can save and favorite your restaurant, making it easy for them to return again and again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-slate-600 text-base sm:text-lg mb-8 md:mb-12">
              Start free, upgrade when you're ready
            </p>

            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <Card className="border-2 border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
                    <div className="text-4xl font-bold text-slate-900 mb-2">$0</div>
                    <p className="text-slate-600">Forever</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#8dbf65] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">List your restaurant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#8dbf65] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Up to 5 photos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#8dbf65] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Basic analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#8dbf65] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Search visibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#8dbf65] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Email support</span>
                    </li>
                  </ul>
                  <Link href="/owner/register">
                    <Button variant="outline" className="w-full border-slate-300">
                      Get Started Free
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#8dbf65] shadow-lg relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#8dbf65] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Coming Soon
                  </span>
                </div>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium</h3>
                    <div className="text-4xl font-bold text-slate-900 mb-2">$29</div>
                    <p className="text-slate-600">per month</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#8dbf65] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Everything in Free</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#8dbf65] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Unlimited photos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#8dbf65] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Priority placement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#8dbf65] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Advanced analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#8dbf65] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Coupon campaigns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#8dbf65] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">Priority support</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-br from-[#8dbf65] to-[#7aaa56] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Star className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Ready to Welcome More Families?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-8 text-white/90">
              Join Nugget today and start connecting with families in your area. It's free to get started and takes less than 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/owner/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-[#8dbf65] hover:bg-slate-50 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/login?redirect=/owner/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-white text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#8dbf65] rounded-xl flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Nugget</span>
              </Link>
              <p className="text-slate-400 text-sm">
                Helping families find welcoming restaurants.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Restaurants</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/owner/register" className="hover:text-white transition-colors">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link href="/login?redirect=/owner/dashboard" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/partner" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/faqs" className="hover:text-white transition-colors">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} Nugget. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
