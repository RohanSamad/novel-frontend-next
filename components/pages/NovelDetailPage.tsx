"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import { Star, ChevronRight, User } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

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

// ✅ Clean interface - use camelCase for client state
interface NovelStats {
  averageRating: number;
  ratingCount: number;
}

// ✅ Interface for API response (snake_case)
interface APINovelStats {
  average_rating: number;
  rating_count: number;
}

interface NovelDetailClientProps {
  initialNovel: Novel;
  initialChapters: Chapter[];
  initialStats: APINovelStats; // ✅ Use API interface for props
  novelId: string;
  slug: string;
}

const NovelDetailClient: React.FC<NovelDetailClientProps> = ({
  initialNovel,
  initialChapters,
  initialStats,
  novelId,
  slug,
}) => {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  // State for client-side interactions
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);

  // ✅ Fixed state initialization
  const [novelStats, setNovelStats] = useState<NovelStats>({
    averageRating: parseFloat(initialStats.average_rating?.toString() || "0"),
    ratingCount: initialStats.rating_count || 0,
  });

  // Use server-rendered data as initial state
  const [novel] = useState<Novel>(initialNovel);
  const [chapters] = useState<Chapter[]>(initialChapters);

  // Fetch user's existing rating if logged in
  useEffect(() => {
    if (user && novelId) {
      fetchUserRating();
    }
  }, [user, novelId]);

  const fetchUserRating = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await axios.get(
        `https://development.mitprogrammer.com/novel/public/api/user-rating/${encodeURIComponent(
          novelId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.data) {
        setUserRating(response.data.data.rating);
      }
    } catch {
      // User hasn't rated this novel yet, which is fine
      console.log("No existing rating found");
    }
  };

  // ✅ Fixed fetchNovelStats function
  const fetchNovelStats = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await axios.get(
        `https://development.mitprogrammer.com/novel/public/api/novels/stats/${encodeURIComponent(
          novelId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data.data;
      if (data) {
        // ✅ Transform API response to camelCase for client state
        setNovelStats({
          averageRating: parseFloat(data.average_rating) || 0,
          ratingCount: data.rating_count || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching novel stats:", error);
    }
  };

  const handleRateNovel = async (rating: number) => {
    if (!user || !novelId) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `https://development.mitprogrammer.com/novel/public/api/novel-ratings`,
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
        }
      );

      const data = response.data.data;
      setUserRating(data.rating);
      fetchNovelStats();
      toast.success("Rating submitted successfully");
      setIsRatingModalOpen(false);
    } catch {
      toast.error("Failed to submit rating");
    }
  };

  const startReading = () => {
    if (chapters.length > 0) {
      const firstChapter = chapters[0];
      router.push(`/novel/${slug}/chapter/${firstChapter.chapter_number}`);
    }
  };

  const getLatestChapter = () => {
    if (chapters.length === 0) return null;
    return chapters.reduce((latest, current) => {
      return new Date(current.created_at) > new Date(latest.created_at)
        ? current
        : latest;
    });
  };

  const latestChapter = getLatestChapter();

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900">Novel Details</span>
        </div>

        {/* Novel Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <Image
                src={novel.cover_image_url}
                alt={novel.title}
                fill
                priority
                fetchPriority="high"
                className="object-cover blur-sm opacity-20"
              />
            </div>

            <div className="relative md:flex p-8">
              {/* Cover Image */}
              <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
                <div className="relative pb-[150%] rounded-lg overflow-hidden shadow-xl">
                  <Image
                    src={novel.cover_image_url}
                    alt={novel.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    width={300}
                    height={450}
                    priority
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
                      {/* ✅ Using correct camelCase properties */}
                      {novelStats.averageRating.toFixed(1)} (
                      {novelStats.ratingCount} ratings)
                    </span>
                  </div>
                  <div className="flex items-center text-primary-600">
                    <User className="w-5 h-5" />
                    <span className="ml-1">{chapters.length} Chapters</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Synopsis
                  </h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {novel.synopsis}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm text-gray-500">Author</h3>
                    {novel.author_id ? (
                      <Link
                        href={`/author/${novel.author_id}`}
                        className="text-primary-600 hover:text-primary-800 font-medium"
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
                    <h3 className="text-sm text-gray-500">Status</h3>
                    <p className="text-gray-900 font-medium capitalize">
                      {novel.status}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Publisher</h3>
                    <p className="text-gray-900 font-medium">
                      {novel.publisher}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Publishing Year</h3>
                    <p className="text-gray-900 font-medium">
                      {novel.publishing_year || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="primary"
                    size="large"
                    icon={<User className="w-5 h-5" />}
                    onClick={startReading}
                    disabled={chapters.length === 0}
                  >
                    Start Reading
                  </Button>

                  {user ? (
                    <Button
                      variant="secondary"
                      size="large"
                      icon={<Star className="w-5 h-5" />}
                      onClick={() => setIsRatingModalOpen(true)}
                    >
                      {userRating > 0
                        ? `Rated ${userRating}/5`
                        : "Rate This Novel"}
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

        {/* Latest Chapter */}
        {latestChapter && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-serif font-bold text-primary-900 mb-4">
              Latest Chapter
            </h2>
            <Link
              href={`/novel/${slug}/chapter/${latestChapter.chapter_number}`}
              className="block hover:bg-gray-50 transition-colors rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-800 font-medium">
                  {latestChapter.chapter_number}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {latestChapter.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Added{" "}
                    {new Date(latestChapter.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
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

        {/* Chapters List */}
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
            <div className="divide-y">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/novel/${slug}/chapter/${chapter.chapter_number}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-800 font-medium">
                      {chapter.chapter_number}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(chapter.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Rate {novel.title}
            </h3>

            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setUserRating(rating)}
                  className={`p-2 rounded-full transition-colors ${
                    rating <= userRating
                      ? "text-yellow-500 hover:text-yellow-600"
                      : "text-gray-300 hover:text-gray-400"
                  }`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating <= userRating ? "fill-current" : ""
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsRatingModalOpen(false);
                  // Reset to existing rating if user cancels
                  fetchUserRating();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleRateNovel(userRating)}
                disabled={userRating === 0}
              >
                Submit Rating
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NovelDetailClient;
