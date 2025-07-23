import React from 'react';
import  Link  from 'next/link';
import { ChevronRight } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900">Privacy Policy</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-3xl font-serif font-bold text-primary-900 mb-8">Privacy Policy</h1>
              
              <div className="prose max-w-none">
                <p className="mb-6">This Privacy Policy describes how Novel Tavern  collects, uses, and shares information about you when you use our website.</p>

                <h2 className="text-xl font-bold mt-8 mb-4">1. Information We Collect</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-4">Information You Provide: We collect information you provide directly to us, such as:
                    <ul className="list-disc pl-6 mt-2">
                      <li>Email address and password when you create an account.</li>
                      <li>Username and profile information.</li>
                      <li>Content you upload or post on our platform.</li>
                      <li>Payment information when you purchase VIP services.</li>
                      <li>Communications you send to us.</li>
                    </ul>
                  </li>
                  <li className="mb-4">Information We Collect Automatically: We automatically collect certain information about your use of our website, such as:
                    <ul className="list-disc pl-6 mt-2">
                      <li>IP address, device type, and browser information.</li>
                      <li>Usage data, such as pages visited, time spent on our website, and links clicked.</li>
                      <li>Cookies and similar tracking technologies.</li>
                    </ul>
                  </li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-4">We use your information for various purposes, including:
                    <ul className="list-disc pl-6 mt-2">
                      <li>Providing and maintaining our website.</li>
                      <li>Personalizing your experience.</li>
                      <li>Processing payments and managing subscriptions.</li>
                      <li>Communicating with you about updates, promotions, and support.</li>
                      <li>Monitoring and analyzing usage trends.</li>
                      <li>Preventing fraud and abuse.</li>
                    </ul>
                  </li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">3. How We Share Your Information</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-4">We may share your information with:
                    <ul className="list-disc pl-6 mt-2">
                      <li>Service providers who assist us with payment processing, data analytics, and other essential functions.</li>
                      <li>Law enforcement or government authorities if required by law.</li>
                      <li>Other users of our website, to the extent that you share information publicly (e.g., in comments or by uploading Content).</li>
                    </ul>
                  </li>
                  <li className="mb-2">We will not sell your personal information to third parties.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">4. Cookies and Tracking Technologies</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">We use cookies and similar tracking technologies to collect information about your browsing behavior. You can control cookies through your browser settings, but disabling cookies may affect your ability to use certain features of our website.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">5. Data Security</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no method of transmission over the Internet is completely secure, and we cannot guarantee the absolute security of your information.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">6. Your Rights</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-4">You have the right to:
                    <ul className="list-disc pl-6 mt-2">
                      <li>Access, correct, or delete your personal information.</li>
                      <li>Opt-out of receiving promotional communications.</li>
                      <li>Disable cookies.</li>
                    </ul>
                  </li>
                  <li className="mb-2">To exercise these rights, please contact us at support@noveltavern.com.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">7. Childrens Privacy</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us, and we will take steps to delete such information.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">We reserve the right to modify this Privacy Policy at any time. Any changes will be effective immediately upon posting on this page. Your continued use of the website constitutes your acceptance of the revised Privacy Policy.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">9. Contact Information</h2>
                <p className="mb-6">For questions or concerns about this Privacy Policy, please contact us at:</p>
                <p className="mb-6">Email: support@noveltavern.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;