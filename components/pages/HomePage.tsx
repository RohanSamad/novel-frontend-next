"use client";
import React, { useEffect, useMemo, memo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchNovels } from "../../store/slices/novelsSlice";
import dynamic from "next/dynamic";
import { Bookmark, Clock, CheckCircle, Flame } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";
import NovelCard from "../novel/NovelCard";
import { Novel, Chapter } from "../../store/slices/novelsSlice";
import Link from "next/link";
import { createSlug } from "../../lib/utils";

const FeaturedNovelCarousel = dynamic(
  () => import("../novel/FeaturedNovelCarousel"),
  {
    loading: () => (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
    ),
    ssr: false,
  }
);

const RecentUpdates = dynamic(() => import("../novel/RecentUpdates"), {
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />,
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

NovelGrid.displayName = "NovelGrid";


const HotNovelsGrid = memo(({ novels }: { novels: Novel[] }) => {
  if (novels.length === 0) return null;
  
  const featuredNovel = novels[0];
  const gridNovels = novels.slice(1, 11); 
  
  
  return (
    <div className="grid gap-2 sm:gap-3 h-[320px] sm:h-[320px] md:h-[380px]  lg:px-[10px] justify-center lg:h-[400px] lg:w-[1241px] w-full 
                    grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7
                    grid-rows-2">
    
      <div className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-2 row-span-1 sm:row-span-2">
        <Link href={`/novel/${createSlug(featuredNovel.title)}`} className="block h-full group">
          <div 
            className="relative h-full rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300 bg-gray-300 dark:bg-gray-600"
            style={{
              backgroundImage: `url(${featuredNovel.cover_image_url || 'https://via.placeholder.com/200x300/cccccc/666666?text=No+Cover'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300" />
            {/* Completed tag for featured novel */}
            {featuredNovel.status?.toLowerCase() === 'completed' && (
              <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                <span className="bg-green-600 text-white text-xs px-1 sm:px-1.5 py-0.5 rounded-full font-normal shadow-md flex items-center gap-0.5 sm:gap-1">
                 
                  <span className="hidden sm:inline">Completed</span>
                  <span className="sm:hidden">✓</span>
                </span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 sm:p-2 md:p-3 text-center">
              <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base line-clamp-2">
                {featuredNovel.title}
              </h3>
              {featuredNovel.author && (
                <p className="text-white/80 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">
                  by {typeof featuredNovel.author === 'string' ? featuredNovel.author : featuredNovel.author?.name || 'Unknown Author'}
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>
      
      {/* Grid novels - single map with responsive visibility */}
      {gridNovels.map((novel, index) => {
        // Show different numbers of novels based on screen size
        const showOnMobile = index < 3; // Show 3 more novels on mobile (total 4 in 2x2 grid)
        const showOnSM = index < 6; // Show 6 novels on small screens
        const showOnMD = index < 8; // Show 8 novels on medium screens
        const showOnLG = index < 10; // Show 10 novels on large screens
        
        let visibilityClasses = "col-span-1 ";
        if (showOnMobile) {
          visibilityClasses += "block ";
        } else {
          visibilityClasses += "hidden ";
        }
        
        if (showOnSM) {
          visibilityClasses += "sm:block ";
        } else {
          visibilityClasses += "sm:hidden ";
        }
        
        if (showOnMD) {
          visibilityClasses += "md:block ";
        } else {
          visibilityClasses += "md:hidden ";
        }
        
        if (showOnLG) {
          visibilityClasses += "lg:block";
        } else {
          visibilityClasses += "lg:hidden";
        }
        
        return (
          <div key={novel.id} className={visibilityClasses}>
            <Link href={`/novel/${createSlug(novel.title)}`} className="block h-full group">
              <div 
                className="relative h-full rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300 bg-gray-300 dark:bg-gray-600"
                style={{
                  backgroundImage: `url(${novel.cover_image_url || 'https://via.placeholder.com/150x200/cccccc/666666?text=No+Cover'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300" />
                {/* Completed tag for grid novels */}
                {novel.status?.toLowerCase() === 'completed' && (
                  <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
                    <span className="bg-green-600 text-white text-xs px-1 py-0.5 rounded-full font-normal shadow-md">
                      <span className="hidden sm:inline">Completed</span>
                      <span className="sm:hidden">✓</span>
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1 sm:p-2 text-center">
                  <h3 className="text-white font-semibold text-xs sm:text-sm line-clamp-2">
                    {novel.title}
                  </h3>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
});

HotNovelsGrid.displayName = "HotNovelsGrid";

const HomePage: React.FC<HomePageProps> = ({
  initialNovels = [],
  initialRecentChapters = [],
}) => {
  const dispatch = useAppDispatch();
  const { novels, status, error } = useAppSelector((state) => state.novels);
  
  // Add theme selector to ensure component re-renders when theme changes
  //const { isDarkMode } = useAppSelector((state) => state.theme);

  useEffect(() => {
    if (initialNovels.length === 0 && status === "idle") {
      dispatch(fetchNovels());
    }
  }, [dispatch, status, initialNovels.length]);

  const displayNovels = initialNovels.length > 0 ? initialNovels : novels;

  const { featuredNovels, newestNovels, completedNovels, hotNovels } = useMemo(() => {
    const sorted = [...displayNovels].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const completedFiltered = displayNovels.filter(
      (novel) => novel.status?.toLowerCase() === 'completed'
    );
    // Shuffle completed novels randomly
    const completed = [...completedFiltered]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);


    const shuffledAllNovels = [...displayNovels].sort(() => Math.random() - 0.5);
    const hot = shuffledAllNovels.slice(0, 13);

    return {
      sortedNovels: sorted,
      featuredNovels: sorted.slice(0, 5),
      newestNovels: sorted.slice(0, 5),
      completedNovels: completed,
      hotNovels: hot,
    };
  }, [displayNovels]);

  const isLoading = initialNovels.length === 0 && status === "loading";
  const hasError = initialNovels.length === 0 && error;

  return (
    <div className="pt-16">

    <section className="py-6 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <FeaturedNovelCarousel novels={featuredNovels} />
        </div>
      </section>


 <section className="py-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-primary-900 dark:text-white flex items-center">
              <Flame className="mr-2 text-red-500" />
            Recommended For You
            </h2>
            <Link
              href="/browse?sort=popular"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium"
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
              <p className="text-error-600 dark:text-red-400">Error loading novels.</p>
            </div>
          ) : hotNovels.length > 0 ? (
            <HotNovelsGrid novels={hotNovels} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No hot novels available yet.</p>
            </div>
          )}
        </div>
      </section>


  

      <section className="py-8 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-primary-900 dark:text-white flex items-center">
              <Bookmark className="mr-2 text-primary-600 dark:text-primary-400" />
              Newest Novels
            </h2>
            <Link
              href="/browse"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium"
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
              <p className="text-error-600 dark:text-red-400">Error loading novels.</p>
            </div>
          ) : (
            <NovelGrid novels={newestNovels} />
          )}
        </div>
      </section>

      

      <section className="py-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-primary-900 dark:text-white flex items-center">
              <Clock className="mr-2 text-primary-600 dark:text-primary-400" />
              Recent Updates
            </h2>
          </div>

          <RecentUpdates initialRecentChapters={initialRecentChapters} />
        </div>
      </section>


      <section className="py-8 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-primary-900 dark:text-white flex items-center">
              <CheckCircle className="mr-2 text-green-600" />
              Completed Novels
            </h2>
            <Link
              href="/browse?status=completed"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium"
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
              <p className="text-error-600 dark:text-red-400">Error loading novels.</p>
            </div>
          ) : completedNovels.length > 0 ? (
            <NovelGrid novels={completedNovels} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No completed novels available yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;