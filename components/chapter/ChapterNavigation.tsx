'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import Button from '../ui/Button';
import type { Chapter } from '../../store/slices/chaptersSlice'; // Update path if needed

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentChapterId: string;
  novelId: string;
  onListClick?: () => void;
}

const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
  chapters,
  currentChapterId,
  novelId,
  onListClick,
}) => {
  const router = useRouter();

  const currentIndex = chapters.findIndex(
    (chapter) => chapter.chapter_number.toString() === currentChapterId
  );

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < chapters.length - 1;

  const toSlug = (str: string) =>
    str.toLowerCase().trim().replace(/\s+/g, '-');

  const handlePrevious = () => {
    if (hasPrevious) {
      const prev = chapters[currentIndex - 1];
      router.push(`/novel/${toSlug(novelId)}/chapter/${prev.chapter_number}`);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const next = chapters[currentIndex + 1];
      router.replace(`/novel/${toSlug(novelId)}/chapter/${next.chapter_number}`);
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <Button
        variant={hasPrevious ? 'primary' : 'ghost'}
        disabled={!hasPrevious}
        onClick={handlePrevious}
        icon={<ChevronLeft className="w-4 h-4" />}
        iconPosition="left"
        className={!hasPrevious ? 'opacity-50 cursor-not-allowed' : ''}
      >
        Previous
      </Button>

      <Button
        variant="primary"
        onClick={onListClick}
        icon={<List className="w-4 h-4" />}
        iconPosition="left"
      >
        Chapters
      </Button>

      <Button
        variant={hasNext ? 'primary' : 'ghost'}
        disabled={!hasNext}
        onClick={handleNext}
        icon={<ChevronRight className="w-4 h-4" />}
        iconPosition="right"
        className={!hasNext ? 'opacity-50 cursor-not-allowed' : ''}
      >
        Next
      </Button>
    </div>
  );
};

export default ChapterNavigation;
