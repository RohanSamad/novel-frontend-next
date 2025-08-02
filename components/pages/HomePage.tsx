"use client";
import React, { useEffect, useMemo, memo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchNovels } from "../../store/slices/novelsSlice";
import dynamic from "next/dynamic";
import { Bookmark, Clock } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";
import NovelCard from "../novel/NovelCard";
import { Novel, Chapter } from "../../store/slices/novelsSlice";
import Link from "next/link";

const FeaturedNovelCarousel = dynamic(
  () => import("../novel/FeaturedNovelCarousel"),
  {
    loading: () => (
      <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
    ),
    ssr: false,
  }
);

const RecentUpdates = dynamic(() => import("../novel/RecentUpdates"), {
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />,
  ssr: false,
});

interface HomePageProps {
  initialNovels?: Novel[];
  initialRecentChapters?: Chapter[];
}

const NovelGrid = memo(({ novels }: { novels: Novel[] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
    {novels.map((novel) => (
      <NovelCard key={novel.id} novel={novel} />
    ))}
  </div>
));

NovelGrid.displayName = 'NovelGrid';

const HomePage: React.FC<HomePageProps> = ({
  initialNovels = [],
  initialRecentChapters = [],
}) => {
  const dispatch = useAppDispatch();
  const { novels, status, error } = useAppSelector((state) => state.novels);

  useEffect(() => {
    if (initialNovels.length === 0 && status === "idle") {
      dispatch(fetchNovels());
    }
  }, [dispatch, status, initialNovels.length]);

  const displayNovels = initialNovels.length > 0 ? initialNovels : novels;

  const {  featuredNovels, newestNovels } = useMemo(() => {
    const sorted = [...displayNovels].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return {
      sortedNovels: sorted,
      featuredNovels: sorted.slice(0, 5),
      newestNovels: sorted.slice(0, 10),
    };
  }, [displayNovels]);

  const isLoading = initialNovels.length === 0 && status === "loading";
  const hasError = initialNovels.length === 0 && error;

  return (
    <div className="pt-16">
      <section className="py-6">
        <div className="container mx-auto px-4">
          <FeaturedNovelCarousel novels={featuredNovels} />
        </div>
      </section>

      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-primary-900 flex items-center">
              <Bookmark className="mr-2 text-primary-600" />
              Newest Novels
            </h2>
            <Link
              href="/browse"
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : hasError ? (
            <div className="text-center py-12">
              <p className="text-error-600">Error loading novels.</p>
            </div>
          ) : (
            <NovelGrid novels={newestNovels} />
          )}
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-primary-900 flex items-center">
              <Clock className="mr-2 text-primary-600" />
              Recent Updates
            </h2>
          </div>

          <RecentUpdates initialRecentChapters={initialRecentChapters} />
        </div>
      </section>
    </div>
  );
};

export default HomePage;