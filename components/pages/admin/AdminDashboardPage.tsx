'use client'
import React from 'react';
import  Link  from 'next/link';
import { BookOpen, Award, BarChart2, Settings, FileText } from 'lucide-react';
import { useAppSelector } from '../../../hooks/redux';

const AdminDashboardPage: React.FC = () => {
  const { novels } = useAppSelector(state => state.novels);
  const { chapters } = useAppSelector(state => state.chapters);
  const { featuredNovels } = useAppSelector(state => state.featured);
  
  // Add theme selector to ensure component re-renders when theme changes
  //const { isDarkMode } = useAppSelector((state) => state.theme);
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold text-primary-900 dark:text-white mb-8">Admin Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full mr-4">
                <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Novels</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(novels.length)}</h3>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{novels.filter(n => n.status === 'ongoing').length} ongoing</span>
              <span>{novels.filter(n => n.status === 'completed').length} completed</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900 rounded-full mr-4">
                <FileText className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Chapters</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(chapters.length)}</h3>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Avg. {(chapters.length / Math.max(1, novels.length)).toFixed(1)} per novel</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-success-100 dark:bg-green-900 rounded-full mr-4">
                <Award className="h-6 w-6 text-success-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Featured Novels</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(featuredNovels.length)}</h3>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{((featuredNovels.length / novels.length) * 100).toFixed(1)}% of total</span>
            </div>
          </div>
        </div>
        
        {/* Admin Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            href="/admin/novels" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded-full mr-4">
              <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Novel Management</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, and delete novels</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/chapters" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="p-4 bg-secondary-100 dark:bg-secondary-900 rounded-full mr-4">
              <FileText className="h-8 w-8 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Chapter Management</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage chapters and audio files</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/featured" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="p-4 bg-accent-100 dark:bg-accent-900 rounded-full mr-4">
              <Award className="h-8 w-8 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Featured Content</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Curate featured novels on homepage</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/analytics" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="p-4 bg-warning-100 dark:bg-yellow-900 rounded-full mr-4">
              <BarChart2 className="h-8 w-8 text-warning-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View detailed statistics and reports</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/settings" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mr-4">
              <Settings className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure system settings</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;