'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LocalHeroApplyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    cityPreference: '',
    motivation: '',
    experience: '',
    bankDetails: {
      accountName: '',
      accountNumber: '',
      sortCode: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in to apply');
      setLoading(false);
      router.push('/login');
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('local_hero_applications')
        .insert({
          user_id: user.id,
          city_preference: formData.cityPreference,
          motivation: formData.motivation,
          experience: formData.experience || null,
          bank_details: formData.bankDetails,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      if (err.code === '23505') {
        setError('You have already submitted an application. Please wait for review.');
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBankDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      bankDetails: {
        ...formData.bankDetails,
        [e.target.name]: e.target.value,
      },
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You need to be logged in to apply as a Local Hero
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]">
                Go to Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              Application Submitted!
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Thank you for your interest in becoming a Local Hero
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-lg text-gray-700 mb-4">
                Your application has been received and is under review. Our team will contact you within 3-5 business days.
              </p>
              <p className="text-sm text-gray-600">
                Check your email for updates on your application status.
              </p>
            </div>
            <Link href="/">
              <Button className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/local-hero" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Local Hero Info
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Apply to Become a Local Hero</CardTitle>
            <CardDescription className="text-lg">
              Tell us about yourself and why you'd be a great Local Hero for your city
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="cityPreference">City *</Label>
                <Input
                  id="cityPreference"
                  name="cityPreference"
                  placeholder="e.g., London, Manchester, Birmingham"
                  value={formData.cityPreference}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-gray-600">
                  Which city do you want to be a Local Hero for?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation">Why do you want to be a Local Hero? *</Label>
                <Textarea
                  id="motivation"
                  name="motivation"
                  placeholder="What motivates you to share your city's dining scene?"
                  value={formData.motivation}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="resize-none"
                />
                <p className="text-sm text-gray-600">
                  Tell us what drives your passion for local restaurants and community building
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Your Experience with Local Dining (Optional)</Label>
                <Textarea
                  id="experience"
                  name="experience"
                  placeholder="Tell us about your experience with restaurants in your city..."
                  value={formData.experience}
                  onChange={handleChange}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-sm text-gray-600">
                  Share your knowledge about local restaurants, food blogs, or dining experiences
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Bank Details for Payouts *</Label>
                <p className="text-sm text-gray-600">
                  We'll use these details to pay your commissions monthly
                </p>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name *</Label>
                  <Input
                    id="accountName"
                    name="accountName"
                    placeholder="Full name on account"
                    value={formData.bankDetails.accountName}
                    onChange={handleBankDetailsChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    placeholder="12345678"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleBankDetailsChange}
                    required
                    maxLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortCode">Sort Code *</Label>
                  <Input
                    id="sortCode"
                    name="sortCode"
                    placeholder="12-34-56"
                    value={formData.bankDetails.sortCode}
                    onChange={handleBankDetailsChange}
                    required
                    maxLength={8}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  By submitting this application, you agree to our terms of service and commission structure.
                  You'll receive an email with next steps if your application is approved.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8dbf65] hover:bg-[#7aaa56] text-white py-6 text-lg"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
