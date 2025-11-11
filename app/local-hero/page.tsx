'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import {
  TrendingUp,
  MapPin,
  DollarSign,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function LocalHeroLandingPage() {
  return (
    <div className="min-h-screen">
      <section className="relative text-white overflow-hidden min-h-[500px] md:min-h-[700px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/local_heros_hero_04 copy.jpg"
            alt="People enjoying food together"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10">
          <Header />
        </div>

        <div className="container mx-auto px-4 pt-8 md:pt-16 pb-16 md:pb-24 max-w-6xl relative z-20">
          <div className="text-center mb-8 md:mb-12">
            <Badge className="bg-[#101729] text-white mb-4 px-4 py-1 text-xs sm:text-sm">
              Earn Money Doing What You Love
            </Badge>
            <h1 className="text-[2.8125rem] sm:text-4xl md:text-5xl lg:text-6xl font-extralight font-serif mb-6 leading-[0.924] sm:leading-tight text-white">
              Become a local hero
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-8 max-w-3xl mx-auto">
              Share your city's best restaurants and earn commission on every booking you inspire
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/local-hero/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-[#8dbf65] hover:bg-[#7aaa56] text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 border-0 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-[#101729] border-[#101729]">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Earn Commission</h3>
                <p className="text-white">Get paid for every booking made through your recommendations</p>
              </CardContent>
            </Card>

            <Card className="bg-[#101729] border-[#101729]">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Your City, Your Knowledge</h3>
                <p className="text-white">Curate the best dining experiences in your neighborhood</p>
              </CardContent>
            </Card>

            <Card className="bg-[#101729] border-[#101729]">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Build Your Community</h3>
                <p className="text-white">Connect food lovers with amazing local restaurants</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">Three simple steps to start earning</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-white text-xl md:text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-4">Sign Up</h3>
              <p className="text-gray-600">
                Create your Local Hero account and get instant access to your dashboard
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-white text-xl md:text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-4">Curate Your City</h3>
              <p className="text-gray-600">
                Add and manage restaurant listings in your area from your dashboard
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#8dbf65] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-white text-xl md:text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-4">Start Earning</h3>
              <p className="text-gray-600">
                Share your favorites and earn commission on bookings through your recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">What You'll Get</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">Benefits of being a Local Hero</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Competitive Commission Rates</h3>
                  <p className="text-gray-600">Earn a percentage of every booking value from restaurants you recommend</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Monthly Payouts</h3>
                  <p className="text-gray-600">Regular payments directly to your bank account</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Exclusive Dashboard</h3>
                  <p className="text-gray-600">Track your clicks, conversions, and earnings in real-time</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Moderation Powers</h3>
                  <p className="text-gray-600">Help curate and improve restaurant listings in your city</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Flexible Schedule</h3>
                  <p className="text-gray-600">Work at your own pace, whenever and wherever you want</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Community Recognition</h3>
                  <p className="text-gray-600">Build your reputation as a trusted local food expert</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Who We're Looking For</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">The ideal Local Hero</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Food Enthusiasts</h3>
                <p className="text-gray-600">You love exploring restaurants and trying new cuisines</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Local Experts</h3>
                <p className="text-gray-600">You know your city's dining scene inside and out</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Community Builders</h3>
                <p className="text-gray-600">You enjoy sharing recommendations with others</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Star className="h-6 w-6 text-[#8dbf65] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Detail-Oriented</h3>
                <p className="text-gray-600">You appreciate quality and accuracy in restaurant information</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <Award className="h-12 w-12 md:h-16 md:w-16 text-[#8dbf65] mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">Ready to Become a Local Hero?</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8">
            Join our growing community of food enthusiasts earning money while sharing their passion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/local-hero/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[#8dbf65] hover:bg-[#7aaa56] text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                Sign Up as Local Hero
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Already have an account? <Link href="/login" className="text-[#8dbf65] hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
