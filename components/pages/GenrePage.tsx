'use client';

import React, { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { filterNovelsByGenre } from '@/store/slices/novelsSlice';
import NovelCard from '@/components/novel/NovelCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

interface Props {
  slug: string;
  genre: {
    name: string;
    description: string;
  } | undefined;
}

export default function GenrePageClient({ slug, genre }: Props) {
  const dispatch = useAppDispatch();
  const { filteredNovels, status } = useAppSelector((state) => state.novels);
  
  // Add theme selector to ensure component re-renders when theme changes
  //const { isDarkMode } = useAppSelector((state) => state.theme);

  useEffect(() => {
    if (slug && genre) {
      dispatch(filterNovelsByGenre(slug));
    }
  }, [dispatch, slug, genre]);

  if (!genre) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-serif font-bold text-primary-900 dark:text-white mb-4">
            Genre Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The genre you are looking for does not exist.
          </p>
          <Link
            href="/genres"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            View All Genres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/genres" className="hover:text-primary-600 dark:hover:text-primary-400">Genres</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 dark:text-white">{genre.name}</span>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary-900 dark:text-white mb-4">
            {genre.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{genre.description}</p>
        </div>

        {/* Novels Grid */}
        {status === 'loading' ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredNovels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No novels found in this genre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredNovels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}