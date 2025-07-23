"use client";
import React from "react";
import Link from "next/link";
import { Novel } from "../../store/slices/novelsSlice";
import { BookOpen, Clock, AlertCircle, Check } from "lucide-react";
import Image from "next/image";

interface NovelCardProps {
  novel: Novel;
  size?: "small" | "medium" | "large";
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (novel: Novel) => void;
}

const NovelCard: React.FC<NovelCardProps> = ({
  novel,
  size = "medium",
  selectable = false,
  selected = false,
  onSelect,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="bg-success-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <BookOpen className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case "ongoing":
        return (
          <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Ongoing
          </span>
        );
      case "hiatus":
        return (
          <span className="bg-warning-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Hiatus
          </span>
        );
      default:
        return null;
    }
  };

  const sizeClasses = {
    small: {
      card: "w-full max-w-[180px]",
      imageContainer: "pb-[150%]", // 2:3 aspect ratio
      title: "text-sm",
      content: "p-2",
    },
    medium: {
      card: "w-full max-w-[250px]",
      imageContainer: "pb-[150%]", // 2:3 aspect ratio
      title: "text-lg",
      content: "p-3",
    },
    large: {
      card: "w-full max-w-[300px]",
      imageContainer: "pb-[150%]", // 2:3 aspect ratio
      title: "text-xl",
      content: "p-4",
    },
  };

  const classes = sizeClasses[size];

  const CardContent = () => (
    <div
      className={` 
      ${classes.card} 
      bg-white rounded-lg shadow-md overflow-hidden 
      transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg
      flex flex-col
      ${selectable ? "cursor-pointer" : ""}
      ${selected ? "ring-2 ring-primary-500" : ""}
      relative
    `}
    >
      <div className="relative w-full">
        {/* Container with fixed aspect ratio */}
        <div className={`${classes.imageContainer} relative`}>
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
          ) : (
            <Image
              src={imageError ? "/fallback-image.jpg" : novel.cover_image_url}
              alt={`Cover for ${novel.title}`}
              className="absolute inset-0 w-full h-full object-cover"
              fill
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}
          <div className="absolute top-2 right-2">
            {getStatusBadge(novel.status)}
          </div>
          {selected && (
            <div className="absolute inset-0 bg-primary-500 bg-opacity-20 flex items-center justify-center">
              <div className="bg-primary-500 rounded-full p-2">
                <Check className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${classes.content} flex-grow flex flex-col bg-white`}>
        <h3
          className={`${classes.title} font-serif font-bold text-primary-900 line-clamp-1`}
        >
          {novel.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">by {novel.author.name}</p>

        <div className="mt-2 flex flex-wrap gap-1">
          {novel.genres?.map((genre) => (
            <span
              key={genre.id}
              className="inline-block bg-primary-100 text-primary-800 rounded-full px-2 py-0.5 text-xs"
            >
              {genre.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (selectable) {
    return (
      <div onClick={() => onSelect?.(novel)}>
        <CardContent />
      </div>
    );
  }

  return (
    <Link
      href={{
        pathname: `/novel/[slug]`,
        query: {
          slug: novel.title.trim().replace(/\s+/g, "-"),
          id: novel.id, // Pass minimal required data
        },
      }}
      as={`/novel/${novel.title.trim().replace(/\s+/g, "-")}`}
    >
      <CardContent />
    </Link>
  );
};

export default NovelCard;
