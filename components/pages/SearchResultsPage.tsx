
'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { searchNovels } from '@/store/slices/novelsSlice';
import NovelCard from '@/components/novel/NovelCard';
import { Search, BookX } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface SearchResultsPageProps {
  query: string;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ query }) => {
  const dispatch = useAppDispatch();
  const { filteredNovels, status } = useAppSelector((state) => state.novels);

  useEffect(() => {
    if (query) {
      dispatch(searchNovels(query));
    }
  }, [dispatch, query]);

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary-900 flex items-center">
            <Search className="w-8 h-8 mr-3 text-primary-600" />
            Search Results
          </h1>
          <p className="text-gray-600 mt-2">
            {query ? (
              <>
                Showing results for <span className="font-medium">{query}</span>
                {filteredNovels.length > 0 && (
                  <span className="ml-2">
                    ({filteredNovels.length} {filteredNovels.length === 1 ? 'result' : 'results'})
                  </span>
                )}
              </>
            ) : (
              'Please enter a search term'
            )}
          </p>
        </div>

        {status === 'loading' ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredNovels.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <BookX className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">No Results Found</h2>
            <p className="text-gray-600 mb-6">
              We could not find any novels matching your search.
              {query && (
                <>
                  <br />
                  Try using different keywords or check the spelling.
                </>
              )}
            </p>
            <Link href="/">
              <Button variant="primary">Return to Home</Button>
            </Link>
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
};

export default SearchResultsPage;
