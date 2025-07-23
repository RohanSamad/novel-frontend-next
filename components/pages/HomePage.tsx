'use client'
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchNovels } from '../../store/slices/novelsSlice';
import FeaturedNovelCarousel from '../novel/FeaturedNovelCarousel';
import NovelCard from '../novel/NovelCard';
import RecentUpdates from '../novel/RecentUpdates';
import { Bookmark, Clock } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { novels, status, error } = useAppSelector(state => state.novels);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNovels());
    }
  }, [dispatch, status]);
  // Sort novels by created_at date, newest first
  const sortedNovels = [...novels].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="pt-16 ">
      {/* Featured Carousel */}
      <section className="py-6">
        <div className="container  mx-auto px-4">
          <FeaturedNovelCarousel />
        </div>
      </section>

      {/* Novel Grid Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-primary-900 flex items-center">
              <Bookmark className="mr-2 text-primary-600" />
              Newest Novels
            </h2>
            <a href="/browse" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              View All
            </a>
          </div>

          {status === 'loading' ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-error-600">Error loading novels.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {sortedNovels.slice(0, 10).map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Updates Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-primary-900 flex items-center">
              <Clock className="mr-2 text-primary-600" />
              Recent Updates
            </h2>
          </div>
          
          <RecentUpdates />
        </div>
      </section>
    </div>
  );
};

export default HomePage;