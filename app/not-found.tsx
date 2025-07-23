'use client'
import React from 'react';
import  Link  from 'next/link';
import { BookX } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-primary-100 rounded-full">
            <BookX className="h-20 w-20 text-primary-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary-900 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We could not find the page you are looking for. It might have been moved, deleted, or never existed.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/">
            <Button variant="primary" size="large">
              Return to Home
            </Button>
          </Link>
          <Link href="/browse">
            <Button variant="outline" size="large">
              Browse Novels
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;