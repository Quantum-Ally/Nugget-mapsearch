export default function PrivacyPage() {
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
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: October 21, 2025</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Information We Collect</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Account information (email address, password)</li>
                <li>Profile information (name, preferences)</li>
                <li>Restaurant reviews and ratings</li>
                <li>Saved searches and favorites</li>
                <li>Communication preferences</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                We also automatically collect certain information about your device and how you interact with our platform, including IP address, browser type, and usage patterns.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your experience and provide recommendations</li>
                <li>Send you updates and marketing communications (with your consent)</li>
                <li>Respond to your comments and questions</li>
                <li>Protect against fraudulent or illegal activity</li>
                <li>Analyze usage patterns to improve our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Information Sharing</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Restaurant partners when you interact with their listings</li>
                <li>Service providers who assist in operating our platform</li>
                <li>Law enforcement when required by law</li>
                <li>Other users when you post public content (reviews, ratings)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Data Security</h2>
              <p className="text-slate-700 leading-relaxed">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Cookies and Tracking</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse cookies, but this may limit your ability to use some features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Your Rights</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Children's Privacy</h2>
              <p className="text-slate-700 leading-relaxed">
                Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Changes to This Policy</h2>
              <p className="text-slate-700 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Contact Us</h2>
              <p className="text-slate-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us through our contact page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
