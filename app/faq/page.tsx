'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState } from 'react';

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is Nugget Markets Restaurant Discovery Platform?',
        a: 'Nugget Markets Restaurant Discovery Platform is a comprehensive platform that helps food lovers discover exceptional local restaurants. We connect diners with curated restaurant selections, detailed information, and personalized recommendations.'
      },
      {
        q: 'Is it free to use?',
        a: 'Yes! Creating an account and browsing restaurants is completely free. You can save favorites, write reviews, and use our search features at no cost.'
      },
      {
        q: 'How do I create an account?',
        a: 'Click the "Sign Up" button in the top right corner, enter your email and password, and you\'re ready to start discovering great restaurants!'
      }
    ]
  },
  {
    category: 'For Diners',
    questions: [
      {
        q: 'How do I search for restaurants?',
        a: 'Use our intelligent search bar to find restaurants by cuisine type, location, dietary preferences, or specific features like "outdoor seating" or "live music". Our natural language search understands conversational queries.'
      },
      {
        q: 'Can I save my favorite restaurants?',
        a: 'Absolutely! Click the heart icon on any restaurant to add it to your favorites list. You can access your saved restaurants anytime from your profile.'
      },
      {
        q: 'How do I write a review?',
        a: 'Visit a restaurant\'s page and click the "Write Review" button. Share your experience, rate different aspects of your visit, and help others discover great dining spots.'
      },
      {
        q: 'Can I filter search results?',
        a: 'Yes! Use our advanced filters to narrow down results by price range, dietary options, amenities, distance, and much more.'
      }
    ]
  },
  {
    category: 'For Restaurant Owners',
    questions: [
      {
        q: 'How do I list my restaurant?',
        a: 'Visit our Restaurant Partner page and click "Get Started". You\'ll create an owner account and can add your restaurant details, photos, menu, and more.'
      },
      {
        q: 'What information should I include in my listing?',
        a: 'Include comprehensive details: business hours, menu items, photos, amenities, parking information, dietary options, and any special features that make your restaurant unique.'
      },
      {
        q: 'Can I update my restaurant information?',
        a: 'Yes! Log in to your owner dashboard to update your restaurant details, hours, photos, and menu anytime. Keeping your information current helps attract more customers.'
      },
      {
        q: 'Is there a cost to list my restaurant?',
        a: 'We offer different subscription tiers for restaurant owners. Basic listings are free, with premium options available for enhanced visibility and additional features.'
      },
      {
        q: 'How do I respond to reviews?',
        a: 'From your owner dashboard, you can view and respond to customer reviews. Engaging with feedback shows you value customer input and helps build trust.'
      }
    ]
  },
  {
    category: 'Local Heroes Program',
    questions: [
      {
        q: 'What is the Local Heroes program?',
        a: 'Our Local Heroes program allows community members to become brand ambassadors, earning commissions by referring restaurants to our platform and helping local businesses thrive.'
      },
      {
        q: 'How do I become a Local Hero?',
        a: 'Visit the Local Hero page and submit an application. Once approved, you\'ll receive your unique referral link and can start earning commissions.'
      },
      {
        q: 'How much can I earn as a Local Hero?',
        a: 'Commission rates vary based on the subscription tier of restaurants you refer. You\'ll earn ongoing commissions for active restaurant subscriptions you bring to the platform.'
      },
      {
        q: 'How do I track my referrals?',
        a: 'Your Local Hero dashboard provides real-time tracking of referrals, commission earnings, and performance metrics.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        q: 'The map is not loading. What should I do?',
        a: 'Try refreshing the page or clearing your browser cache. Make sure you have a stable internet connection. If the problem persists, contact our support team.'
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click the "Forgot Password" link on the login page. Enter your email address and we\'ll send you instructions to reset your password.'
      },
      {
        q: 'Which browsers are supported?',
        a: 'Our platform works best on the latest versions of Chrome, Firefox, Safari, and Edge. Make sure your browser is up to date for the best experience.'
      },
      {
        q: 'Is there a mobile app?',
        a: 'Currently, our platform is web-based and fully responsive, working seamlessly on mobile browsers. A dedicated mobile app is in development.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        q: 'How is my personal information protected?',
        a: 'We use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for detailed information on how we handle your information.'
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Contact our support team or use the account deletion option in your profile settings. Note that this action is permanent and cannot be undone.'
      },
      {
        q: 'Do you share my data with third parties?',
        a: 'We do not sell your personal information. We only share data with service providers necessary to operate our platform, and when required by law. See our Privacy Policy for details.'
      }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      item =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Find answers to common questions about our platform
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>

        <div className="space-y-8">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-600 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-slate-500 mt-2">Try a different search term or browse all categories</p>
            </div>
          ) : (
            filteredFaqs.map((category, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left text-slate-900 hover:text-slate-700">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-700 leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Still have questions?</h3>
          <p className="text-slate-700 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
