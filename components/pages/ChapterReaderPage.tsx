"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/hooks/redux";
import AudioPlayer from "@/components/chapter/AudioPlayer";
import ChapterNavigation from "@/components/chapter/ChapterNavigation";
import ChapterSelector from "@/components/chapter/ChapterSelector";
import { ArrowLeft, BookOpen, Moon, PlayCircle, Sun } from "lucide-react";

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

const ChapterReaderClient: React.FC<ChapterReaderClientProps> = ({
  selectedNovel,
  chapters,
  selectedChapter,
  novelId,
  chapterId,
  slug,
}) => {
  const { userProgress } = useAppSelector((state) => state.progress);
  const { user } = useAppSelector((state) => state.auth);

  // Same loadPreferences logic as your original code
  const loadPreferences = (): ChapterPreferences => {
    if (typeof window !== "undefined") {
      const savedPrefs = localStorage.getItem("chapterPreferences");
      if (savedPrefs) return JSON.parse(savedPrefs);
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

  // Same useEffect for saving preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chapterPreferences", JSON.stringify(preferences));
    }
  }, [preferences]);

  // Same progress logic as your original code
  const progressKey = novelId && chapterId ? `${novelId}-${chapterId}` : "";
  const savedProgress = userProgress[progressKey];
  const initialPosition = savedProgress?.audio_position || 0;

  // Same toggle functions as your original code
  const toggleTheme = () => {
    setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light",
    }));
  };

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

  const handleChapterEnd = () => {
    if (!preferences.autoPlayEnabled) return;
    const currentIndex = chapters.findIndex(
      (chapter) => chapter.chapter_number.toString() === chapterId
    );
    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      window.location.href = `/novel/${slug}/chapter/${nextChapter.chapter_number}`;
    }
  };

  // Same formatChapterContent logic as your original code
  const formatChapterContent = (content: string) => {
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

  return (
    <div
      className={`pt-16 min-h-screen ${
        preferences.theme === "dark"
          ? "bg-gray-900 text-gray-200"
          : "bg-gray-50 text-gray-800"
      }`}
    >
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
                className={`relative p-2 rounded-full flex flex-col items-center justify-center ${
                  preferences.autoPlayEnabled
                    ? "bg-primary-100 text-primary-600"
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
                <PlayCircle className="w-5 h-5" />
                <span className="absolute top-8 text-[10px] sm:block hidden leading-none">
                  AutoPlay
                </span>
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
                onClick={toggleTheme}
                className={`p-2 rounded-full ${
                  preferences.theme === "dark"
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                }`}
                aria-label="Toggle theme"
              >
                {preferences.theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
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
          {/* Audio not playing note */}
          <div className="mb-4 p-4 bg-warning-50 text-warning-800 rounded-lg">
            <p className="text-sm">
              NOTE: Audio not playing? Try to sign out and retry! If still not
              working, remain signed out and retry! Autoplay feature on the top
              bar only works for Chrome browsers on desktops and Android
              devices. If autoplay failed to play the audio, turn it off,
              refresh the page and turn it on again.
            </p>
          </div>

          {/* Audio Player */}
          <div className="mb-6">
            <AudioPlayer
              audioUrl={selectedChapter.audio_url || "default-audio-url.mp3"}
              initialPosition={initialPosition}
              novelId={novelId || ""}
              chapterId={chapterId || ""}
              userId={user?.id}
              autoPlay={preferences.autoPlayEnabled}
              onEnded={handleChapterEnd}
            />
          </div>

          {/* Chapter Navigation */}
          <div className="mb-6">
            <ChapterNavigation
              chapters={chapters}
              currentChapterId={chapterId || ""}
              // novelId={novelId || ""}
              novelSlug={slug || ""} 
              onListClick={() => setIsChapterSelectorOpen(true)}
            />
          </div>

          {/* Chapter Text Content */}
          <div
            className={`prose max-w-none ${
              preferences.theme === "dark" ? "prose-invert" : ""
            }`}
            style={{ fontSize: `${preferences.fontSize}px` }}
            dangerouslySetInnerHTML={{
              __html: formatChapterContent(selectedChapter.content_text),
            }}
          />

          {/* Bottom Chapter Navigation */}
          <div className="mt-12">
            <ChapterNavigation
              chapters={chapters}
              currentChapterId={chapterId || ""}
              // novelId={slug || ""}
              novelSlug={slug || ""} 
              onListClick={() => setIsChapterSelectorOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Chapter Selector Modal */}
      <ChapterSelector
        chapters={chapters}
        currentChapterId={chapterId || ""}
        novelId={novelId || ""}
        isOpen={isChapterSelectorOpen}
        onClose={() => setIsChapterSelectorOpen(false)}
      />
    </div>
  );
};

export default ChapterReaderClient;
