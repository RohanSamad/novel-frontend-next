"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { fetchFeaturedNovels } from "../../store/slices/featuredSlice";
import { fetchNovels } from "../../store/slices/novelsSlice";
import Link from "next/link";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import Image from "next/image";

const FeaturedNovelCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coverImageError, setCoverImageError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );
  const dispatch = useAppDispatch();
  const { featuredNovels, status, error } = useAppSelector(
    (state) => state.featured
  );
  const novelsStatus = useAppSelector((state) => state.novels.status);

  useEffect(() => {
    // First make sure we have novels data
    if (novelsStatus === "idle") {
      dispatch(fetchNovels());
    }
    // Then fetch featured novels data
    if (status === "idle") {
      dispatch(fetchFeaturedNovels());
    }
  }, [dispatch, status, novelsStatus]);

  const nextSlide = () => {
    if (isAnimating || featuredNovels.length === 0) return;
    setIsAnimating(true);
    setSlideDirection("right");
    setCurrentIndex((prevIndex) =>
      prevIndex === featuredNovels.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating || featuredNovels.length === 0) return;
    setIsAnimating(true);
    setSlideDirection("left");
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? featuredNovels.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (featuredNovels.length > 1) {
        nextSlide();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [featuredNovels.length, isAnimating]);

  if (status === "loading" || novelsStatus === "loading") {
    return (
      <div className="w-full h-96 flex justify-center items-center bg-gray-100 rounded-lg">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || featuredNovels.length === 0) {
    return (
      <div className="w-full h-96 flex justify-center items-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No featured novels available</p>
      </div>
    );
  }

  const currentNovel = featuredNovels[currentIndex]?.novel;

  if (!currentNovel) return null;

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-md">
      <div
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out ${
          isAnimating
            ? slideDirection === "right"
              ? "-translate-x-full"
              : "translate-x-full"
            : "translate-x-0"
        } ${coverImageError ? "bg-primary-900" : ""}`}
        style={
          coverImageError
            ? {}
            : { backgroundImage: `url(${currentNovel?.cover_image_url})` }
        }
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-transparent"></div>
      </div>

      <div
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out ${
          isAnimating
            ? "translate-x-0"
            : slideDirection === "right"
            ? "translate-x-full"
            : "-translate-x-full"
        }`}
        style={{
          backgroundImage: `url(${
            featuredNovels[
              slideDirection === "right"
                ? currentIndex === featuredNovels.length - 1
                  ? 0
                  : currentIndex + 1
                : currentIndex === 0
                ? featuredNovels.length - 1
                : currentIndex - 1
            ]?.novel?.cover_image_url
          })`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-transparent"></div>
      </div>

      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-white z-10 space-y-4 mb-6 md:mb-0">
            <span className="inline-block bg-accent-500 text-white px-3 py-1 rounded-full text-sm">
              Hot Novel
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              {currentNovel.title}
            </h2>
            <p className="text-white/80">by {currentNovel.author.name}</p>
            <p className="line-clamp-3">{currentNovel.synopsis}</p>
            <Link
              href={{
                pathname: `/novel/${currentNovel.title
                  .trim()
                  .replace(/\s+/g, "-")}`,
                query: { novelId: currentNovel.id }, // or whatever fields you need
              }}
            >
              {" "}
              <Button variant="accent" size="medium">
                Read Now
              </Button>
            </Link>
          </div>

          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="w-48 h-72 md:w-56 md:h-80 shadow-lg rounded-lg overflow-hidden transform rotate-3 transition-transform hover:rotate-0 duration-300">
              {coverImageError ? (
                <div className="w-full h-full flex items-center justify-center bg-primary-800">
                  <BookOpen className="w-16 h-16 text-primary-300" />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={
                      coverImageError
                        ? "/fallback-cover.jpg"
                        : currentNovel?.cover_image_url || "/fallback-cover.jpg"
                    }
                    alt={currentNovel?.title || "Novel cover"}
                    fill
                    className="object-cover"
                    unoptimized={
                      !currentNovel?.cover_image_url?.startsWith("http")
                    }
                    onError={() => setCoverImageError(true)}
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 text-white transition-colors z-20"
        aria-label="Previous novel"
        disabled={isAnimating}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 text-white transition-colors z-20"
        aria-label="Next novel"
        disabled={isAnimating}
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {featuredNovels.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (isAnimating) return;
              setIsAnimating(true);
              setSlideDirection(index > currentIndex ? "right" : "left");
              setCurrentIndex(index);
              setTimeout(() => setIsAnimating(false), 500);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            disabled={isAnimating}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedNovelCarousel;
