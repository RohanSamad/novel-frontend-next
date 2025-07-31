'use client'
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchNovels } from '../../store/slices/novelsSlice';
import NovelCard from '../novel/NovelCard';
import { Search, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import  Link  from 'next/link';

const BrowseAllPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { novels, status } = useAppSelector(state => state.novels);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNovels());
    }
  }, [dispatch, status]);

  const sortedNovels = [...novels].sort((a, b) => a.title.localeCompare(b.title));

  const filteredNovels = searchQuery
    ? sortedNovels.filter(novel =>
        novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        novel.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        novel.genres?.some(genre => 
          genre.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : sortedNovels;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNovels = filteredNovels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNovels.length / itemsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900">Browse All</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary-900 mb-4">Browse All Novels</h1>
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </form>
        </div>

        {status === 'loading' ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredNovels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No novels found matching your search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {currentNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseAllPage;