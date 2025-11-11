'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { searchRestaurants, type RestaurantSuggestion } from '@/lib/restaurant-lookup';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Store, CheckCircle, Search, Loader2 } from 'lucide-react';

interface SuggestRestaurantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuggestRestaurantModal({ open, onOpenChange }: SuggestRestaurantModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<RestaurantSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    address: '',
    city: '',
    postcode: '',
    phone: '',
    website: '',
    description: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      cuisine: '',
      address: '',
      city: '',
      postcode: '',
      phone: '',
      website: '',
      description: '',
    });
    setSubmitted(false);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleNameChange = async (value: string) => {
    setFormData({ ...formData, name: value });

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchRestaurants(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const selectSuggestion = (suggestion: RestaurantSuggestion) => {
    setFormData({
      ...formData,
      name: suggestion.name,
      address: suggestion.address,
      city: suggestion.city,
      postcode: suggestion.postcode,
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to suggest a restaurant',
        variant: 'destructive',
      });
      onOpenChange(false);
      router.push('/login?redirect=/search');
      return;
    }

    if (!formData.name || !formData.cuisine || !formData.address || !formData.city) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('restaurant_suggestions')
        .insert([
          {
            user_id: user.id,
            name: formData.name,
            cuisine: formData.cuisine,
            address: formData.address,
            city: formData.city,
            postcode: formData.postcode || null,
            phone: formData.phone || null,
            website: formData.website || null,
            description: formData.description || null,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: 'Success!',
        description: 'Thank you for suggesting a restaurant. We will review it soon.',
      });
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit suggestion',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl mb-2">Thank You!</DialogTitle>
            <DialogDescription className="text-base mb-6">
              Your restaurant suggestion has been submitted successfully. Our team will review it and add it to our platform if it meets our criteria.
            </DialogDescription>
            <div className="space-y-3">
              <Button
                className="w-full bg-[#8dbf65] hover:bg-[#7aaa56]"
                onClick={() => resetForm()}
              >
                Suggest Another Restaurant
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleClose(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#8dbf65] rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Suggest a Restaurant</DialogTitle>
              <DialogDescription>
                Know a great family-friendly spot? Let us know!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2 relative">
            <Label htmlFor="name">
              Restaurant Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                placeholder="e.g., The Family Kitchen"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                required
                className="pr-10"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              )}
              {!searching && formData.name && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-[80] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-slate-900">{suggestion.name}</div>
                    <div className="text-sm text-slate-600 mt-0.5">{suggestion.fullAddress}</div>
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-500">
              Start typing to search for restaurants and auto-fill details
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuisine">
              Cuisine Type <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cuisine"
              placeholder="e.g., Italian, British, Indian"
              value={formData.cuisine}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                placeholder="e.g., London"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                placeholder="e.g., SW1A 1AA"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Street Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              placeholder="123 High Street"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+44 20 1234 5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Why do you recommend this restaurant?
            </Label>
            <Textarea
              id="description"
              placeholder="Tell us what makes this place special for families..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-slate-500">
              Share what makes this restaurant family-friendly, memorable, or worth visiting
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 text-sm">What happens next?</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Our team will review your suggestion</li>
              <li>• We will verify the details and contact the restaurant</li>
              <li>• If approved, it will be added to our platform</li>
              <li>• You will help families discover great places to eat!</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#8dbf65] hover:bg-[#7aaa56]"
            >
              {loading ? 'Submitting...' : 'Submit Suggestion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
