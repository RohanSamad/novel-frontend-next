'use client'
import React, { useState } from 'react';
import  Link  from 'next/link';
import { ChevronRight, Mail, Send } from 'lucide-react';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';

const ContactPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create mailto link with form data
    const mailtoLink = `mailto:mushcoomers@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${email}\n\n${message}`)}`;

    // Open default mail client
    window.location.href = mailtoLink;

    // Show success message
    toast.success('Opening your email client...');
    setIsSubmitting(false);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900">Contact Us</span>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-serif font-bold text-primary-900">Contact Us</h1>
                  <p className="text-gray-600 mt-1">We love to hear from you</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell us what you need help with..."
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  isLoading={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  Send Message
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>You can also email us directly at:</p>
            <a 
              href="mailto:mushcoomers@gmail.com"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              mushcoomers@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;