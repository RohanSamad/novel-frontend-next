"use client";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import { Star, ChevronRight, Calendar, BookOpen } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

// ✅ Lazy load heavy components
const RatingModal = dynamic(() => import("@/components/ui/RatingModal"), {
  loading: () => <div>Loading...</div>,
});

interface Author {
  id?: string;
  name: string;
}

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  created_at: string;
}

interface Novel {
  id: string;
  title: string;
  synopsis: string;
  cover_image_url: string;
  author_id?: string;
  author: Author;
  status: string;
  publisher: string;
  publishing_year?: string;
  genres?: Genre[];
}

interface NovelStats {
  averageRating: number;
  ratingCount: number;
}

interface APINovelStats {
  average_rating: number;
  rating_count: number;
}

interface NovelDetailClientProps {
  initialNovel: Novel;
  initialChapters: Chapter[];
  initialStats: APINovelStats;
  novelId: string;
  slug: string;
}

// ✅ Memoized sub-components for better performance
const NovelHeader = memo(
  ({
    novel,
    novelStats,
    chapters,
    onStartReading,
    onRateClick,
    user,
    userRating,
  }: {
    novel: Novel;
    novelStats: NovelStats;
    chapters: Chapter[];
    onStartReading: () => void;
    onRateClick: () => void;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
    } | null;
    userRating: number;
  }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
      <div className="relative">
        {/* ✅ Optimized background image with better loading */}
        <div className="absolute inset-0">
          <Image
            src={novel.cover_image_url}
            alt="Background cover"
            fill
            className="object-cover blur-sm opacity-20"
            sizes="100vw"
            priority={false}
            fetchPriority="low"
            quality={35}
            placeholder="empty" 
          />
        </div>

        <div className="relative md:flex p-8">
          {/* ✅ Optimized cover image */}
          <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
            <div className="relative pb-[150%] rounded-lg overflow-hidden shadow-xl">
              <Image
                src={novel.cover_image_url}
                alt={`Cover of ${novel.title}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                priority
                fetchPriority="high"
                quality={75}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
          </div>

          {/* Novel Info */}
          <div className="md:w-2/3 lg:w-3/4 md:pl-8 mt-6 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-900 mb-2">
              {novel.title}
            </h1>

            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div className="flex items-center text-yellow-600">
                <Star className="w-5 h-5 fill-current" />
                <span className="ml-1">
                  {novelStats.averageRating.toFixed(1)} (
                  {novelStats.ratingCount} ratings)
                </span>
              </div>
              <div className="flex items-center text-primary-600">
                <BookOpen className="w-5 h-5" />
                <span className="ml-1">{chapters.length} Chapters</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Synopsis
              </h2>
              <p className="text-gray-600 whitespace-pre-line line-clamp-6">
                {novel.synopsis}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <h3 className="text-gray-500 mb-1">Author</h3>
                {novel.author_id ? (
                  <Link
                    href={`/author/${novel.author_id}`}
                    className="text-primary-600 hover:text-primary-800 font-medium transition-colors"
                  >
                    {novel.author.name}
                  </Link>
                ) : (
                  <p className="text-gray-900 font-medium">
                    {novel.author.name}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-gray-500 mb-1">Status</h3>
                <p className="text-gray-900 font-medium capitalize">
                  {novel.status}
                </p>
              </div>
              <div>
                <h3 className="text-gray-500 mb-1">Publisher</h3>
                <p className="text-gray-900 font-medium">{novel.publisher}</p>
              </div>
              <div>
                <h3 className="text-gray-500 mb-1">Publishing Year</h3>
                <p className="text-gray-900 font-medium">
                  {novel.publishing_year || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                variant="primary"
                size="large"
                icon={<BookOpen className="w-5 h-5" />}
                onClick={onStartReading}
                disabled={chapters.length === 0}
              >
                Start Reading
              </Button>

              {user ? (
                <Button
                  variant="secondary"
                  size="large"
                  icon={<Star className="w-5 h-5" />}
                  onClick={onRateClick}
                >
                  {userRating > 0 ? `Rated ${userRating}/5` : "Rate This Novel"}
                </Button>
              ) : (
                <Link href="/signin">
                  <Button
                    variant="secondary"
                    size="large"
                    icon={<Star className="w-5 h-5" />}
                  >
                    Sign in to Rate
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
);

NovelHeader.displayName = "NovelHeader";

// ✅ Memoized chapter item for better list performance
const ChapterItem = memo(
  ({ chapter, slug }: { chapter: Chapter; slug: string }) => (
    <Link
      href={`/novel/${slug}/chapter/${chapter.chapter_number}`}
      className="block p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-800 font-medium flex-shrink-0">
          {chapter.chapter_number}
        </div>
        <div className="ml-4 min-w-0 flex-1">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {chapter.title}
          </h3>
          <p className="text-sm text-gray-500 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(chapter.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  )
);

ChapterItem.displayName = "ChapterItem";

const NovelDetailClient: React.FC<NovelDetailClientProps> = ({
  initialNovel,
  initialChapters,
  initialStats,
  novelId,
  slug,
}) => {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  // ✅ Optimized state management
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isLoadingRating, setIsLoadingRating] = useState(false);

  // ✅ Convert initial stats once and memoize
  const [novelStats, setNovelStats] = useState<NovelStats>(() => ({
    averageRating: parseFloat(initialStats.average_rating?.toString() || "0"),
    ratingCount: initialStats.rating_count || 0,
  }));

  // ✅ Use server-rendered data as initial state
  const novel = useMemo(() => initialNovel, [initialNovel]);
  const chapters = useMemo(() => initialChapters, [initialChapters]);

  // ✅ Memoize latest chapter calculation
  const latestChapter = useMemo(() => {
    if (chapters.length === 0) return null;
    return chapters.reduce((latest, current) => {
      return new Date(current.created_at) > new Date(latest.created_at)
        ? current
        : latest;
    });
  }, [chapters]);

  // ✅ Optimized API calls with proper error handling and caching
  const fetchUserRating = useCallback(async () => {
    if (!user || !novelId) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-rating/${encodeURIComponent(
          novelId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          timeout: 5000, // ✅ Add timeout
        }
      );

      if (response.data.data) {
        setUserRating(response.data.data.rating);
      }
    } catch {
      // Silent fail for missing rating
      console.log("No existing rating found");
    }
  }, [user, novelId]);

  const fetchNovelStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/novels/stats/${encodeURIComponent(
          novelId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          timeout: 5000, // ✅ Add timeout
        }
      );

      const data = response.data.data;
      if (data) {
        setNovelStats({
          averageRating: parseFloat(data.average_rating) || 0,
          ratingCount: data.rating_count || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching novel stats:", error);
      toast.error("Failed to update ratings");
    }
  }, [novelId]);

  const handleRateNovel = useCallback(
    async (rating: number) => {
      if (!user || !novelId || isLoadingRating) return;

      setIsLoadingRating(true);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/novel-ratings`,
          {
            novel_id: novelId,
            rating,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            timeout: 10000, // ✅ Add timeout
          }
        );

        const data = response.data.data;
        setUserRating(data.rating);
        await fetchNovelStats(); // Refresh stats
        toast.success("Rating submitted successfully");
        setIsRatingModalOpen(false);
      } catch (error) {
        toast.error("Failed to submit rating");
        console.error("Rating error:", error);
      } finally {
        setIsLoadingRating(false);
      }
    },
    [user, novelId, isLoadingRating, fetchNovelStats]
  );

  const startReading = useCallback(() => {
    if (chapters.length > 0) {
      const firstChapter = chapters[0];
      router.push(`/novel/${slug}/chapter/${firstChapter.chapter_number}`);
    }
  }, [chapters, router, slug]);

  const handleRateClick = useCallback(() => {
    setIsRatingModalOpen(true);
  }, []);

  // ✅ Fetch user rating on mount/login
  useEffect(() => {
    if (user && novelId) {
      fetchUserRating();
    }
  }, [user, novelId, fetchUserRating]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* ✅ Optimized breadcrumb */}
        <nav
          className="flex items-center text-sm text-gray-500 mb-6"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" aria-hidden="true" />
          <span className="text-gray-900">Novel Details</span>
        </nav>

        {/* ✅ Use memoized header component */}
        <NovelHeader
          novel={novel}
          novelStats={novelStats}
          chapters={chapters}
          onStartReading={startReading}
          onRateClick={handleRateClick}
          user={user}
          userRating={userRating}
        />

        {/* Latest Chapter */}
        {latestChapter && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-serif font-bold text-primary-900 mb-4">
              Latest Chapter
            </h2>
            <ChapterItem chapter={latestChapter} slug={slug} />
          </div>
        )}

        {/* Genres */}
        {novel.genres && novel.genres.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-serif font-bold text-primary-900 mb-4">
              Genres
            </h2>
            <div className="flex flex-wrap gap-2">
              {novel.genres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genre/${genre.slug}`}
                  className="px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm hover:bg-primary-200 transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Optimized chapters list */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-serif font-bold text-primary-900">
              Chapters ({chapters.length})
            </h2>
          </div>

          {chapters.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No chapters available yet.
            </div>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto">
              {chapters.map((chapter) => (
                <ChapterItem key={chapter.id} chapter={chapter} slug={slug} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Lazy-loaded rating modal */}
      {isRatingModalOpen && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onRate={handleRateNovel}
          currentRating={userRating}
          novelTitle={novel.title}
          isLoading={isLoadingRating}
        />
      )}
    </>
  );
};

export default memo(NovelDetailClient);
