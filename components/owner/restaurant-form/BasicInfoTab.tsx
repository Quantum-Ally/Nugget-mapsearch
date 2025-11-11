'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

const cuisineTypes = [
  'American',
  'British',
  'Chinese',
  'French',
  'Greek',
  'Indian',
  'Italian',
  'Japanese',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Spanish',
  'Thai',
  'Turkish',
  'Vietnamese',
  'Other',
];

export default function BasicInfoTab({ formData, setFormData }: BasicInfoTabProps) {
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            Restaurant Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter restaurant name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisine">
            Cuisine Type <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.cuisine} onValueChange={(value) => handleChange('cuisine', value)}>
            <SelectTrigger id="cuisine">
              <SelectValue placeholder="Select cuisine type" />
            </SelectTrigger>
            <SelectContent>
              {cuisineTypes.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the restaurant, its atmosphere, and what makes it special..."
          rows={4}
        />
        <p className="text-sm text-slate-500">
          Tell potential customers what makes this restaurant unique
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+44 20 1234 5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price_level">Price Level</Label>
          <Select
            value={formData.price_level?.toString()}
            onValueChange={(value) => handleChange('price_level', parseInt(value))}
          >
            <SelectTrigger id="price_level">
              <SelectValue placeholder="Select price level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">£ - Budget</SelectItem>
              <SelectItem value="2">££ - Moderate</SelectItem>
              <SelectItem value="3">£££ - Expensive</SelectItem>
              <SelectItem value="4">££££ - Very Expensive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="website_url">Website URL</Label>
          <Input
            id="website_url"
            type="url"
            value={formData.website_url}
            onChange={(e) => handleChange('website_url', e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="google_maps_url">Google Maps URL</Label>
          <Input
            id="google_maps_url"
            type="url"
            value={formData.google_maps_url}
            onChange={(e) => handleChange('google_maps_url', e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) => handleChange('image_url', e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-sm text-slate-500">
          Link to a high-quality image of the restaurant
        </p>
      </div>
    </div>
  );
}
