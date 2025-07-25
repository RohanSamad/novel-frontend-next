'use client'
import React from 'react';
import { useAppSelector } from '../hooks/redux';
import { User, Mail, Calendar, Clock } from 'lucide-react';
import  Link  from 'next/link';

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);

  if (!user) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Signed In</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <Link 
            href="/signin"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-primary-600" />
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-2">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span>Member since {new Date().toLocaleDateString()}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3" />
                  <span>Last sign in: {new Date().toLocaleString()}</span>
                </div>
              </div>

              {user.role === 'admin' && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h2>
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Go to Admin Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;