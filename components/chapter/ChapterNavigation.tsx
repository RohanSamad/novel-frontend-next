"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import Button from "../ui/Button";
import type { Chapter } from "../../store/slices/chaptersSlice";

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentChapterId: string;
  novelSlug: string; // Changed from novelId to novelSlug - receives original URL slug
  onListClick?: () => void;
}

const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
  chapters,
  currentChapterId,
  novelSlug, // Use the original slug directly
  onListClick,
}) => {
  const router = useRouter();

  const currentIndex = chapters.findIndex(
    (chapter) => chapter.chapter_number.toString() === currentChapterId
  );

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < chapters.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      const prev = chapters[currentIndex - 1];
      // Use the original novelSlug directly - no conversion needed
      router.replace(`/novel/${novelSlug}/chapter/${prev.chapter_number}`);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const next = chapters[currentIndex + 1];
      // Use the original novelSlug directly - no conversion needed
      router.push(`/novel/${novelSlug}/chapter/${next.chapter_number}`);
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <Button
        variant={hasPrevious ? "primary" : "ghost"}
        disabled={!hasPrevious}
        onClick={handlePrevious}
        icon={<ChevronLeft className="w-4 h-4" />}
        iconPosition="left"
        className={!hasPrevious ? "opacity-50 cursor-not-allowed" : ""}
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
        variant={hasNext ? "primary" : "ghost"}
        disabled={!hasNext}
        onClick={handleNext}
        icon={<ChevronRight className="w-4 h-4" />}
        iconPosition="right"
        className={!hasNext ? "opacity-50 cursor-not-allowed" : ""}
      >
        Next
      </Button>
    </div>
  );
};

export default ChapterNavigation;
