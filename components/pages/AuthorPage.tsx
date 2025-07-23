"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchNovelsByAuthorId } from "@/store/slices/novelsSlice";
import { fetchAuthorById } from "@/store/slices/authorsSlice";
import NovelCard from "@/components/novel/NovelCard";
import { ChevronRight, User } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import Image from "next/image";

const AuthorPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const id = typeof params?.id === "string" ? params.id : null;

  const { selectedAuthor, status: authorStatus } = useAppSelector(
    (state) => state.authors
  );
  const { filteredNovels, status: novelsStatus } = useAppSelector(
    (state) => state.novels
  );

  useEffect(() => {
    if (!id) {
      router.push("/404");
      return;
    }

    dispatch(fetchAuthorById(id));
    dispatch(fetchNovelsByAuthorId(id));
  }, [dispatch, id, router]);

  if (authorStatus === "loading" || novelsStatus === "loading") {
    return (
      <div className="pt-20 min-h-screen flex justify-center items-start">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!selectedAuthor) {
    return (
      <div className="pt-20 min-h-screen container mx-auto px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-serif font-bold text-primary-900 mb-4">
            Author Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The author you are looking for does not exist or has been removed.
          </p>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900">Author</span>
        </div>

        {/* Author Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            {selectedAuthor.avatar_url ? (
              <div className="relative w-20 h-20">
                <Image
                  src={selectedAuthor.avatar_url}
                  alt={selectedAuthor.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                  unoptimized={!selectedAuthor.avatar_url?.startsWith("http")}
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png"; // Fallback image
                  }}
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary-600" />
              </div>
            )}
            <div className="ml-6">
              <h1 className="text-3xl font-serif font-bold text-primary-900">
                {selectedAuthor.name}
              </h1>
              {selectedAuthor.bio && (
                <p className="text-gray-600 mt-2">{selectedAuthor.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Novels Grid */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-primary-900 mb-6">
            Novels by {selectedAuthor.name}
          </h2>
          {filteredNovels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No novels found for this author.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorPage;
