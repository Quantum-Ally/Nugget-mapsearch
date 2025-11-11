import { MapPin, Heart, Users, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white sticky top-0 z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2">
            <img
              src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
              alt="Nugget"
              className="h-16"
            />
          </a>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-slate-900 hover:text-slate-600 font-medium">Home</a>
            <a href="/about" className="text-slate-900 hover:text-slate-600 font-medium">About</a>
            <a href="/partner" className="text-slate-900 hover:text-slate-600 font-medium">Partner</a>
            <a href="/faq" className="text-slate-900 hover:text-slate-600 font-medium">FAQ</a>
            <a href="/login" className="text-slate-900 hover:text-slate-600 font-medium">Sign In</a>
            <a href="/signup" className="bg-[#8dbf65] hover:bg-[#7aad52] text-white px-4 py-2 rounded-md font-medium">Sign Up</a>
          </nav>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">About Nugget</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our mission is to make dining out easier and more fun for families.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-semibold text-slate-900 mb-6">Origins</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed mb-4">
              Parenthood is a wild ride.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4"> 
              Life gets busier, sillier, messier, and more joyful - a rollercoaster of emotions that never stops moving. But enjoying life together as a family? That often gets harder.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              Travel feels daunting. Eating out becomes stressful. Even grabbing a simple cup of coffee can feel impossible.
              When my son, affectionately nicknamed “Nugget”, was born in 2019, I realized how challenging it was to leave the house with kids.
              Does this café have a baby change? Will I feel welcome here? Should I just stay home instead? Too often, the answer pushed us back inside. My husband was left changing diapers on the floor because men’s rooms rarely had baby-change facilities.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              By the time my daughter arrived in 2021, I knew something had to change.
              Parenthood shouldn’t mean navigating constant hurdles- it should be about exploration, discovery, and joy for the whole family.
              I’ve met so many other parents who face even more challenges: families navigating accessibility barriers, neurodiversity, food allergies, and other needs that are too often overlooked.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
            That’s why I created The Nugget App: to make it easier for families to enjoy life together.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
            We save you time and stress by giving you the details that actually matter, paired with trusted reviews from other parents. And we’re using this data for impact: showing businesses and cities who their spaces are welcoming, and who’s being left out.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
            Together, we’re sharing our favorite places, raising the bar for “family-friendly,” and building a world where all families - and every family member - feel welcome wherever they go.
              </p>
            <p className="text-slate-700 leading-relaxed mb-4">
            💚 Thanks for being part of our mission.
            -Faith Lyons<br />
            Founder and Mom of 2 Nuggets‍<br />
            </p>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Vision</h1>
            <p className="text-slate-700 leading-relaxed mb-4">
              We believe that dining is more than just eating—it's about experiences, connections, and discovering the unique flavors that make each community special. Our platform brings together passionate restaurant owners and curious diners in a seamless, intuitive experience.
            </p>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Mission</h1>
            <p className="text-slate-700 leading-relaxed">
              Today, we're proud to help thousands of restaurants connect with customers who appreciate quality, authenticity, and exceptional dining experiences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Local Focus</h3>
            <p className="text-slate-600">
              Highlighting the best restaurants in your community
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Curated Selection</h3>
            <p className="text-slate-600">
              Carefully chosen restaurants for quality and authenticity
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Community Driven</h3>
            <p className="text-slate-600">
              Built by food lovers, for food lovers
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Quality First</h3>
            <p className="text-slate-600">
              Committed to showcasing exceptional dining experiences
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12">
          <h2 className="text-3xl font-semibold text-slate-900 mb-6">Our Mission</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Our mission is to create meaningful connections between restaurants and diners through technology that enhances the discovery experience. We empower restaurant owners with tools to showcase their unique offerings while providing diners with intelligent search and personalized recommendations.
          </p>
          <p className="text-slate-700 leading-relaxed">
            We're committed to supporting local businesses, promoting culinary diversity, and making it easier than ever to find your next great meal.
          </p>
        </div>
      </div>
    </div>
  );
}
