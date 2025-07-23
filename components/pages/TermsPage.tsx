import React from 'react';
import  Link  from 'next/link';
import { ChevronRight } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900">Terms of Service</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-3xl font-serif font-bold text-primary-900 mb-8">Terms of Service</h1>
              
              <div className="prose max-w-none">
                <p className="mb-6">Welcome to Novel Tavern!</p>
                <p className="mb-6">By accessing or using our website, you agree to be bound by these Terms of Service (Terms). Please read them carefully. If you do not agree with any part of these Terms, you must refrain from using our website.</p>

                <h2 className="text-xl font-bold mt-8 mb-4">1. General Use of the Website</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">Novel Tavern provides a platform for users to discover and enjoy audiobooks and novels. The content on our website (Content) is primarily uploaded by our members, authors, and contributors. We do not claim ownership of the Content unless explicitly stated.</li>
                  <li className="mb-2">By accessing the website, you agree that you will not use the Content for illegal or unauthorized purposes, including but not limited to copyright infringement.</li>
                  <li className="mb-2">You may freely read and listen to the Content on our website for personal, non-commercial use. Any redistribution, reproduction, or modification of the Content must comply with applicable copyright laws and these Terms.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">2. User-Generated Content</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">Users are solely responsible for the Content they upload or post on our platform, including but not limited to novels, chapters, audio files, and comments. By uploading Content, users affirm that they have the necessary rights, licenses, or permissions to share such materials.</li>
                  <li className="mb-2">You retain all rights to your Content, but grant Novel Tavern a non-exclusive, worldwide, royalty-free license to use, reproduce, distribute, and display your Content on our platform for the purpose of providing our services.</li>
                  <li className="mb-2">We reserve the right to remove or disable access to any Content that we determine, in our sole discretion, violates these Terms of Service, infringes upon the rights of others, or is otherwise objectionable.</li>
                  <li className="mb-2">If you believe that any Content on our site infringes your copyright or other intellectual property rights, please notify us immediately through the contact information provided below.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">3. Intellectual Property Rights</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">All trademarks, logos, and service marks displayed on this website are the property of Novel Tavern or their respective owners.</li>
                  <li className="mb-2">You agree not to modify, copy, reproduce, republish, upload, post, transmit, or distribute any Content or materials from our website without obtaining proper authorization from the original copyright holder or Novel Tavern, as applicable.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">4. DMCA Compliance</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">Novel Tavern complies with the Digital Millennium Copyright Act (DMCA). If you are the copyright owner or authorized to act on behalf of one, and you believe that your work has been copied in a way that constitutes copyright infringement, you may submit a DMCA notice to us.</li>
                  <li className="mb-4">To file a DMCA notice, please email us at support@noveltavern.com with the subject line DMCA Notice and include:
                    <ul className="list-disc pl-6 mt-2">
                      <li>A description of the copyrighted work that you claim has been infringed.</li>
                      <li>The URL of the infringing material on Novel Tavern.</li>
                      <li>Your contact information (name, address, email, and phone number).</li>
                      <li>A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.</li>
                      <li>A statement under penalty of perjury that the information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owners behalf.</li>
                      <li>Your physical or electronic signature.</li>
                    </ul>
                  </li>
                </ol>

                {/* Continue with remaining sections */}
                <h2 className="text-xl font-bold mt-8 mb-4">5. External Links</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">Our website may contain links to third-party websites. We do not control, endorse, or take responsibility for the content or policies of these third-party sites. You access them at your own risk, and you should review their respective terms and privacy policies.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">6. Limitations of Liability</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">Novel Tavern and its owners, employees, or affiliates shall not be held responsible for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or Content, even if we have been advised of the possibility of such damages.</li>
                  <li className="mb-2">We do not guarantee the accuracy, reliability, or completeness of the Content posted by users. You acknowledge that you may encounter Content that is inaccurate, offensive, or otherwise objectionable.</li>
                  <li className="mb-2">Novel Tavern is not responsible for any technical malfunctions, errors, or interruptions that may occur on our website.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">7. Payment and VIP Services</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">We offer premium VIP services that provide users with additional benefits, such as ad-free access, exclusive Content, or early access to new releases. By purchasing VIP services, you agree to the terms of payment, including any applicable fees and billing cycles.</li>
                  <li className="mb-2">All payments are processed securely through our payment partners. You agree to provide accurate and up-to-date payment information.</li>
                  <li className="mb-2">VIP subscriptions may automatically renew unless canceled prior to the renewal date. You are responsible for managing your subscription settings.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">8. Refund Policy</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">We strive to ensure customer satisfaction with our services. If you encounter any issues, please contact our support team for assistance.</li>
                  <li className="mb-4">Refunds for VIP services may be issued under the following conditions:
                    <ul className="list-disc pl-6 mt-2">
                      <li>The service was not delivered as promised due to technical issues on our side.</li>
                      <li>The user submits a refund request within 7 days of purchase.</li>
                    </ul>
                  </li>
                  <li className="mb-2">Refund requests will be reviewed on a case-by-case basis. To request a refund, please contact us at support@noveltavern.com with your account details and proof of purchase. We reserve the right to deny refunds if we determine that the request is fraudulent or violates these Terms.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">9. Modification of Terms</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">We reserve the right to modify these Terms of Service at any time. Any changes will be effective immediately upon posting on this page. Your continued use of the website constitutes your acceptance of the revised Terms.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">10. Termination</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">We may suspend or terminate your access to the website if you violate these Terms of Service, engage in prohibited activities, or for any other reason, without prior notice.</li>
                  <li className="mb-2">Upon termination, you must cease all use of our website and Content.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">11. Governing Law</h2>
                <ol className="list-decimal pl-6 mb-6">
                  <li className="mb-2">These Terms of Service shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles.</li>
                </ol>

                <h2 className="text-xl font-bold mt-8 mb-4">12. Contact Information</h2>
                <p className="mb-6">For questions, concerns, or DMCA notices, please contact us at:</p>
                <p className="mb-6">Email: support@noveltavern.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;