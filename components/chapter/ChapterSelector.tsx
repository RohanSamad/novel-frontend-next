'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import type { Chapter } from '../../store/slices/chaptersSlice'; // Update path based on your project

interface ChapterSelectorProps {
  chapters: Chapter[];
  currentChapterId: string;
  novelSlug: string; // Changed from novelId to novelSlug
  onClose: () => void;
  isOpen: boolean;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  chapters,
  currentChapterId,
  novelSlug, // Changed from novelId to novelSlug
  onClose,
  isOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const filteredChapters = searchQuery
    ? chapters.filter((chapter) =>
        chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.chapter_number.toString().includes(searchQuery)
      )
    : chapters;

  const handleChapterSelect = (chapterNumber: string) => {
    const targetUrl = `/novel/${novelSlug}/chapter/${chapterNumber}`;
    console.log('🚀 ChapterSelector navigating to:', targetUrl);
    router.push(targetUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-primary-900">Chapter List</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-grow">
          {filteredChapters.length > 0 ? (
            <ul className="divide-y">
              {filteredChapters.map((chapter) => (
                <li key={chapter.id}>
                  <button
                    onClick={() =>
                      handleChapterSelect(chapter.chapter_number.toString())
                    }
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      chapter.chapter_number.toString() === currentChapterId
                        ? 'bg-primary-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="w-10 h-10 flex-shrink-0 bg-primary-100 rounded-full flex items-center justify-center text-primary-800 font-medium">
                        {chapter.chapter_number}
                      </span>
                      <div className="ml-3">
                        <span className="block font-medium text-gray-900">
                          {chapter.title}
                        </span>
                        <span className="block text-sm text-gray-500">
                          {new Date(chapter.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No chapters found matching {searchQuery}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterSelector;