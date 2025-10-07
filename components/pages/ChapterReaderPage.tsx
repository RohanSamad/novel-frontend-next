"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import AudioPlayer from "@/components/chapter/AudioPlayer";
import ChapterNavigation from "@/components/chapter/ChapterNavigation";
import ChapterSelector from "@/components/chapter/ChapterSelector";
import { ArrowLeft, BookOpen, PlayCircle } from "lucide-react";
import OptimizedAdRow from "@/components/adrows/OptimizedAdRow";

interface ChapterPreferences {
  theme: "light" | "dark";
  fontSize: number;
  autoPlayEnabled: boolean;
}

interface Novel {
  id: string;
  title: string;
  [key: string]: unknown;
}

interface Chapter {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  content_text: string;
  audio_url: string;
  order_index: number;
  created_at: string;
  [key: string]: unknown;
}

interface ChapterReaderClientProps {
  selectedNovel: Novel;
  chapters: Chapter[];
  selectedChapter: Chapter;
  novelId: string;
  chapterId: string;
  slug: string;
}

// Ad Slot Component
const AdSlot: React.FC<{
  id: string;
  className?: string;
  theme?: "light" | "dark";
}> = ({ id, className = "", theme }) => {
  useEffect(() => {
    // Initialize ad slot when component mounts
    const initAd = () => {
      try {
        // Your ad initialization logic here
        // This is where you'd typically call your ad network's display function
        console.log(`Initializing ad slot: ${id}`);
      } catch (error) {
        console.error(`Error initializing ad slot ${id}:`, error);
      }
    };

    const timer = setTimeout(initAd, 100);
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div 
      className={`w-full flex justify-center my-4 ${className}`}
      id={id}
    >
      <div 
        className={`min-h-[100px] w-full max-w-[728px] flex items-center justify-center rounded-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        {/* Placeholder content - remove this in production */}
        <span className="text-sm text-gray-500">Advertisement</span>
      </div>
    </div>
  );
};

const ChapterReaderClient: React.FC<ChapterReaderClientProps> = ({
  selectedNovel,
  chapters,
  selectedChapter,
  novelId,
  chapterId,
  slug,
}) => {
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { userProgress } = useAppSelector((state) => state.progress);
  const { user } = useAppSelector((state) => state.auth);
  // Access global theme state from Redux
  const { isDarkMode } = useAppSelector((state) => state.theme);
  const router = useRouter();

  const loadPreferences = (): ChapterPreferences => {
    if (typeof window !== "undefined") {
      const savedPrefs = localStorage.getItem("chapterPreferences");
      if (savedPrefs) {
        try {
          return JSON.parse(savedPrefs);
        } catch (error) {
          console.error("Error parsing preferences:", error);
        }
      }
    }
    return {
      theme: "light",
      fontSize: 16,
      autoPlayEnabled: false,
    };
  };

  const [preferences, setPreferences] = useState<ChapterPreferences>(
    loadPreferences()
  );
  const [isChapterSelectorOpen, setIsChapterSelectorOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Validate required data
  useEffect(() => {
    try {
      if (!selectedNovel || !selectedChapter || !chapters?.length || !slug) {
        setError("Missing required chapter data");
        return;
      }
      setIsLoading(false);
    } catch (err) {
      setError("Error loading chapter data");
      console.error("Data validation error:", err);
    }
  }, [selectedNovel, selectedChapter, chapters, slug]);

  // Sync local theme with global Redux theme
  useEffect(() => {
    setPreferences((prev) => ({
      ...prev,
      theme: isDarkMode ? "dark" : "light",
    }));
  }, [isDarkMode]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("chapterPreferences", JSON.stringify(preferences));
      } catch (error) {
        console.error("Error saving preferences:", error);
      }
    }
  }, [preferences]);

  // Get progress data
  const progressKey = novelId && chapterId ? `${novelId}-${chapterId}` : "";
  const savedProgress = userProgress[progressKey];
  const initialPosition = savedProgress?.audio_position || 0;

  // Find next chapter for autoplay navigation
  const findNextChapter = useCallback(() => {
    if (!chapters?.length || !chapterId) return null;
    
    // Try to find by chapter ID first, then by chapter number
    const currentIndex = chapters.findIndex(
      (chapter) => chapter.id === chapterId
    );
    
    // If not found by ID, try by chapter number
    if (currentIndex === -1) {
      const currentIndexByNumber = chapters.findIndex(
        (chapter) => chapter.chapter_number.toString() === chapterId
      );
      
      if (currentIndexByNumber >= 0 && currentIndexByNumber < chapters.length - 1) {
        return chapters[currentIndexByNumber + 1];
      }
    }
    
    if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
      return chapters[currentIndex + 1];
    }
    return null;
  }, [chapters, chapterId]);

  // Handle chapter end - navigate to next chapter if autoplay is enabled
  const handleChapterEnd = useCallback(() => {
    if (!preferences.autoPlayEnabled || !slug) {
      return;
    }

    const nextChapter = findNextChapter();
    if (!nextChapter) {
      return;
    }

    setIsNavigating(true);

    // Use Next.js router for better performance
    try {
      const nextUrl = `/novel/${encodeURIComponent(slug)}/chapter/${nextChapter.chapter_number}`;
      router.push(nextUrl);
    } catch (error) {
      console.error("Router navigation failed:", error);
      setIsNavigating(false);
      // Don't fallback to window.location to avoid full page reload
    }
  }, [preferences.autoPlayEnabled, findNextChapter, slug, router]);

  // Reset navigation state when chapter changes
  useEffect(() => {
    setIsNavigating(false);
  }, [chapterId]);

  const increaseFontSize = () => {
    setPreferences((prev) => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 2, 24),
    }));
  };

  const decreaseFontSize = () => {
    setPreferences((prev) => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 2, 12),
    }));
  };

  const toggleAutoPlay = () => {
    setPreferences((prev) => ({
      ...prev,
      autoPlayEnabled: !prev.autoPlayEnabled,
    }));
  };

  const formatChapterContent = (content: string) => {
    if (!content) return "";
    
    const paragraphs = content
      .split(/(?:<\/p>|<br\s*\/?\>|\n)/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p) => p.replace(/<p>|<br\s*\/?\>/g, "").trim());
    const urlPattern = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    return paragraphs
      .map((p) => {
        const withLinks = p.replace(
          urlPattern,
          (url) =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700 underline">${url}</a>`
        );
        return `<p class="mb-6">${withLinks}</p>`;
      })
      .join("\n\n");
  };

  // Validate audio URL
  const isValidAudioUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    try {
      new URL(url);
      return url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg') || url.includes('.m4a');
    } catch {
      return false;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error || !selectedNovel || !selectedChapter || !chapters?.length) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Chapter Loading Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "Unable to load chapter content. Please try again later."}
          </p>
          <Link 
            href={slug ? `/novel/${slug}` : "/"} 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {slug ? "Back to Novel" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  // Get clean audio URL
  const audioUrl = selectedChapter?.audio_url || '';
  const hasValidAudio = isValidAudioUrl(audioUrl);
  const content = selectedChapter?.content_text || '';

  return (
    <div
      className={`pt-16 min-h-screen ${
        preferences.theme === "dark"
          ? "bg-gray-900 text-gray-200"
          : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Navigation Loading Indicator */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary-600 text-white p-2 text-center text-sm">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Loading next chapter...
          </div>
        </div>
      )}

      {/* Novel/Chapter Info Bar */}
      <div
        className={`sticky top-16 z-30 ${
          preferences.theme === "dark" ? "bg-gray-800" : "bg-white"
        } shadow-md`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <Link href={`/novel/${slug}`} className="flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <div>
                  <h2 className="font-serif font-bold text-lg line-clamp-1">
                    {selectedNovel.title}
                  </h2>
                  <p
                    className={`text-sm ${
                      preferences.theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Chapter {selectedChapter.chapter_number}:{" "}
                    {selectedChapter.title}
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleAutoPlay}
                className={`relative p-2 rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
                  preferences.autoPlayEnabled
                    ? "bg-primary-100 text-primary-600 ring-2 ring-primary-300"
                    : preferences.theme === "dark"
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                }`}
                aria-label="Toggle auto-play"
                title={
                  preferences.autoPlayEnabled
                    ? "Auto-play enabled"
                    : "Auto-play disabled"
                }
              >
                <PlayCircle className={`w-5 h-5 ${preferences.autoPlayEnabled ? 'animate-pulse' : ''}`} />
                <span className="absolute top-8 text-[10px] sm:block hidden leading-none">
                  AutoPlay
                </span>
                {preferences.autoPlayEnabled && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </button>

              <button
                onClick={decreaseFontSize}
                className={`p-2 rounded-full ${
                  preferences.theme === "dark"
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                }`}
                aria-label="Decrease font size"
              >
                <span className="font-medium">A-</span>
              </button>
              <button
                onClick={increaseFontSize}
                className={`p-2 rounded-full ${
                  preferences.theme === "dark"
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                }`}
                aria-label="Increase font size"
              >
                <span className="font-medium">A+</span>
              </button>
              <button
                onClick={() => setIsChapterSelectorOpen(true)}
                className={`p-2 rounded-full ${
                  preferences.theme === "dark"
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                }`}
                aria-label="Chapter list"
              >
                <BookOpen className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* AD SLOT 1: Above Audio Player */}
          <AdSlot 
            id="ad-slot-above-audio" 
            theme={preferences.theme}
            className="mb-6"
          />

          {/* Audio Player Section */}
          <div className="mb-6">
            {hasValidAudio ? (
              <AudioPlayer
                audioUrl={audioUrl}
                initialPosition={initialPosition}
                novelId={novelId}
                chapterId={chapterId}
                userId={user?.id}
                autoPlay={preferences.autoPlayEnabled}
                onEnded={handleChapterEnd}
              />
            ) : (
              <div className={`p-4 rounded-lg text-center ${
                preferences.theme === "dark" 
                  ? "bg-gray-800 text-gray-400" 
                  : "bg-gray-50 text-gray-700"
              }`}>
                <p className="text-sm">Audio not available for this chapter</p>
              </div>
            )}
          </div>

          {/* Audio troubleshooting note - only show if audio should be available */}
          {hasValidAudio && (
            <div className={`mb-4 p-4 rounded-lg ${
              preferences.theme === "dark"
                ? "bg-yellow-900/20 text-yellow-300"
                : "bg-warning-50 text-warning-800"
            }`}>
              <p className="text-sm">
                <strong>Audio Troubleshooting:</strong> If audio isn&apos;t playing, try refreshing the page. 
                AutoPlay may be blocked by your browser - this is normal. If audio fails to start automatically, 
                you can click the play button manually.
              </p>
            </div>
          )}

          {/* Chapter Navigation */}
          <div className="mb-6">
            <ChapterNavigation
              chapters={chapters}
              currentChapterId={chapterId || ""}
              novelSlug={slug || ""}
              onListClick={() => setIsChapterSelectorOpen(true)}
            />
          </div>

          {/* AD SLOT 2: Below Chapter Navigation (after audio player) */}
          <OptimizedAdRow/>
		  
          {/* Chapter Text Content */}
          <div
            className={`prose max-w-none ${
              preferences.theme === "dark" ? "prose-invert" : ""
            }`}
            style={{ fontSize: `${preferences.fontSize}px` }}
            dangerouslySetInnerHTML={{
              __html: formatChapterContent(content),
            }}
          />

          {/* Bottom Chapter Navigation */}
          <div className="mt-12">
            <ChapterNavigation
              chapters={chapters}
              currentChapterId={chapterId || ""}
              novelSlug={slug || ""}
              onListClick={() => setIsChapterSelectorOpen(true)}
            />
          </div>

          {/* AD SLOT 3: Below Bottom Chapter Navigation */}
          <AdSlot 
            id="ad-slot-below-navigation-2" 
            theme={preferences.theme}
            className="mt-6"
          />
        </div>
      </div>

      {/* Chapter Selector Modal */}
      <ChapterSelector
        chapters={chapters}
        currentChapterId={chapterId || ""}
        novelSlug={slug || ""}
        isOpen={isChapterSelectorOpen}
        onClose={() => setIsChapterSelectorOpen(false)}
      />
    </div>
  );
};

export default ChapterReaderClient;