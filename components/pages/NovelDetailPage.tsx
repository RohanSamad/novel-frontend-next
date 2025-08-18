"use client";
import { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import { Star, ChevronRight, Calendar, BookOpen, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

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

interface ChaptersApiResponse {
  data: Chapter[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface NovelDetailClientProps {
  initialNovel: Novel;
  initialChapters: Chapter[];
  latestChapter: Chapter;
  initialStats: APINovelStats;
  novelId: string;
  slug: string;
  totalChapters: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// API function for fetching chapters
async function getChaptersData(novelId: string, page: number = 1): Promise<ChaptersApiResponse> {
  try {
    const response = await fetch(
      `${API_BASE}/api/chapters/novel/${encodeURIComponent(novelId)}?page=${page}&short_query=true`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 1800,
          tags: [`chapters-${novelId}`],
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch chapters: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return { 
      data: [], 
      current_page: 1, 
      last_page: 1, 
      per_page: 20, 
      total: 0 
    };
  }
}

const NovelHeader = memo(
  ({
    novel,
    novelStats,
    totalChapters,
    onStartReading,
    onRateClick,
    user,
    userRating,
  }: {
    novel: Novel;
    novelStats: NovelStats;
    totalChapters: number;
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
                <span className="ml-1">{totalChapters} Chapters</span>
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
                disabled={totalChapters === 0}
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
  latestChapter,
  initialStats,
  novelId,
  slug,
  totalChapters,
}) => {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isLoadingRating, setIsLoadingRating] = useState(false);

  const [novelStats, setNovelStats] = useState<NovelStats>(() => ({
    averageRating: parseFloat(initialStats.average_rating?.toString() || "0"),
    ratingCount: initialStats.rating_count || 0,
  }));

  // Chapter loading states
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [hasMoreChapters, setHasMoreChapters] = useState(true);
  const [chapterError, setChapterError] = useState<string | null>(null);

  const novel = useMemo(() => initialNovel, [initialNovel]);

  // Load more chapters function
  const loadMoreChapters = useCallback(async () => {
    if (isLoadingChapters || !hasMoreChapters) return;

    setIsLoadingChapters(true);
    setChapterError(null);

    try {
      const nextPage = currentPage + 1;
      const response = await getChaptersData(novelId, nextPage);
      
      if (response.data && response.data.length > 0) {
        setChapters(prev => {
          // Avoid duplicates by filtering out chapters that already exist
          const existingIds = new Set(prev.map(ch => ch.id));
          const newChapters = response.data.filter(ch => !existingIds.has(ch.id));
          return [...prev, ...newChapters];
        });
        setCurrentPage(nextPage);
        
        // Check if we've reached the last page
        if (nextPage >= response.last_page || chapters.length + response.data.length >= totalChapters) {
          setHasMoreChapters(false);
        }
      } else {
        setHasMoreChapters(false);
      }
    } catch (error) {
      console.error("Error loading more chapters:", error);
      setChapterError("Failed to load more chapters. Please try again.");
      toast.error("Failed to load more chapters");
    } finally {
      setIsLoadingChapters(false);
    }
  }, [isLoadingChapters, hasMoreChapters, currentPage, novelId, totalChapters, chapters.length]);

  // Intersection Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastChapterRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingChapters) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreChapters) {
        loadMoreChapters();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px',
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingChapters, hasMoreChapters, loadMoreChapters]);

  // Initialize hasMoreChapters based on initial data
  useEffect(() => {
    console.log("Initial chapters length:", initialChapters);
    if (initialChapters.length >= totalChapters) {
      setHasMoreChapters(false);
    }
  }, [initialChapters.length, totalChapters]);

  const fetchUserRating = useCallback(async () => {
    if (!user || !novelId) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await axios.get(
        `${API_BASE}/api/user-rating/${encodeURIComponent(
          novelId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          timeout: 5000,
        }
      );

      if (response.data.data) {
        setUserRating(response.data.data.rating);
      }
    } catch {}
  }, [user, novelId]);

  const fetchNovelStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await axios.get(
        `${API_BASE}/api/novels/stats/${encodeURIComponent(
          novelId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          timeout: 5000,
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
          `${API_BASE}/api/novel-ratings`,
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
            timeout: 10000,
          }
        );

        const data = response.data.data;
        setUserRating(data.rating);
        await fetchNovelStats();
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

  useEffect(() => {
    if (user && novelId) {
      fetchUserRating();
    }
  }, [user, novelId, fetchUserRating]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
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

        <NovelHeader
          novel={novel}
          novelStats={novelStats}
          totalChapters={totalChapters}
          onStartReading={startReading}
          onRateClick={handleRateClick}
          user={user}
          userRating={userRating}
        />

        {latestChapter && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-serif font-bold text-primary-900 mb-4">
              Latest Chapter
            </h2>
            <ChapterItem chapter={latestChapter} slug={slug} />
          </div>
        )}

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

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-serif font-bold text-primary-900">
              Chapters ({totalChapters})
            </h2>
          </div>

          {chapters.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No chapters available yet.
            </div>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto">
              {chapters?.map((chapter, index) => (
                <div
                  key={chapter.id}
                  ref={
                    index === chapters.length - 1 ? lastChapterRef : null
                  }
                >
                  <ChapterItem chapter={chapter} slug={slug} />
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoadingChapters && (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                    <span className="text-gray-500">Loading more chapters...</span>
                  </div>
                </div>
              )}
              
              {/* Error state */}
              {chapterError && (
                <div className="p-6 text-center">
                  <p className="text-red-500 mb-2">{chapterError}</p>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={loadMoreChapters}
                    disabled={isLoadingChapters}
                  >
                    Try Again
                  </Button>
                </div>
              )}
              
              {/* End of chapters indicator */}
              {!hasMoreChapters && chapters.length > 0 && chapters.length >= totalChapters && (
                <div className="p-6 text-center text-gray-500">
                  You&apos;ve reached the end of all chapters.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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