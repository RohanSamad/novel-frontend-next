"use client";

import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { fetchRecentChapters } from "@/store/slices/chaptersSlice";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface RecentUpdatesProps {
  initialRecentChapters?: {
    id: number;
    title: string;
    chapter_number: number;
    novel_title: string;
    created_at: string;
  }[];
}

const RecentUpdates: React.FC<RecentUpdatesProps> = ({
  initialRecentChapters = [],
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { recentChapters, status, error } = useAppSelector(
    (state) => state.chapters
  );

  useEffect(() => {
    if (initialRecentChapters.length === 0 && status === "idle") {
      dispatch(fetchRecentChapters());
    }
  }, [dispatch, status, initialRecentChapters.length]);

  const displayChapters =
    initialRecentChapters.length > 0 ? initialRecentChapters : recentChapters;

  const isLoading = initialRecentChapters.length === 0 && status === "loading";
  const hasError = initialRecentChapters.length === 0 && error;

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-10">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full py-10 text-center">
        <p className="text-red-600">Error loading recent updates.</p>
      </div>
    );
  }

  if (displayChapters.length === 0) {
    return (
      <div className="w-full py-10 text-center">
        <p className="text-gray-500">No recent updates available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Chapter
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Novel
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Updated
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {displayChapters.map((chapter) => (
            <tr
              key={chapter.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => {
                const slug = chapter.novel_title.trim().replace(/\s+/g, "-");
                router.push(`/novel/${slug}/chapter/${chapter.chapter_number}`);
              }}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                      {chapter.chapter_number}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Chapter {chapter.chapter_number}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {chapter.title}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {chapter.novel_title}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDistanceToNow(new Date(chapter.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentUpdates;
