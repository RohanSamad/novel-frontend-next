'use client'
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchNovels } from '../../../store/slices/novelsSlice';
import { fetchChaptersByNovelId } from '../../../store/slices/chaptersSlice';
import { BarChart2, BookOpen, Clock, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';

const AdminAnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { novels, status: novelsStatus } = useAppSelector(state => state.novels);
  const { chapters } = useAppSelector(state => state.chapters);
  const { featuredNovels } = useAppSelector(state => state.featured);

  useEffect(() => {
    if (novelsStatus === 'idle') {
      dispatch(fetchNovels());
    }
  }, [dispatch, novelsStatus]);

  useEffect(() => {
    novels.forEach(novel => {
      dispatch(fetchChaptersByNovelId(novel.id));
    });
  }, [dispatch, novels]);

  const stats = {
    totalNovels: novels.length,
    ongoingNovels: novels.filter(n => n.status === 'ongoing').length,
    completedNovels: novels.filter(n => n.status === 'completed').length,
    totalChapters: chapters.length,
    averageChaptersPerNovel: chapters.length / Math.max(1, novels.length),
    featuredNovels: featuredNovels.length,
    genreDistribution: novels.reduce((acc, novel) => {
      novel.genres?.forEach(genre => {
        acc[genre.name] = (acc[genre.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
  };

  if (novelsStatus === 'loading') {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <BarChart2 className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Detailed statistics and insights about your platform</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Novels</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalNovels}</h3>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{stats.ongoingNovels} ongoing</span>
              <span>{stats.completedNovels} completed</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <Clock className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Chapters</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalChapters}</h3>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Avg. {stats.averageChaptersPerNovel.toFixed(1)} per novel</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <TrendingUp className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Featured Novels</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.featuredNovels}</h3>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{((stats.featuredNovels / stats.totalNovels) * 100).toFixed(1)}% of total</span>
            </div>
          </div>
        </div>

        {/* Genre Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Genre Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(stats.genreDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([genre, count]) => (
                <div key={genre} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700">{genre}</h3>
                  <div className="mt-2 flex items-end">
                    <div className="text-2xl font-bold text-primary-600">{count}</div>
                    <div className="ml-2 text-sm text-gray-500">novels</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {((count / stats.totalNovels) * 100).toFixed(1)}% of total
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Novel Status Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Novel Status Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-24 text-sm text-gray-500">Ongoing</div>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${(stats.ongoingNovels / stats.totalNovels) * 100}%` }}
                ></div>
              </div>
              <div className="ml-4 text-sm font-medium text-gray-700">{stats.ongoingNovels}</div>
            </div>
            <div className="flex items-center">
              <div className="w-24 text-sm text-gray-500">Completed</div>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success-500 rounded-full"
                  style={{ width: `${(stats.completedNovels / stats.totalNovels) * 100}%` }}
                ></div>
              </div>
              <div className="ml-4 text-sm font-medium text-gray-700">{stats.completedNovels}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;