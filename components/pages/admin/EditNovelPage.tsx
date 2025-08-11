"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { BookOpen, Upload, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchNovelById, updateNovel } from "@/store/slices/novelsSlice";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Image from "next/image";

interface Genre {
  id: string;
  name: string;
  slug: string;
}

const EditNovelPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedNovel, status } = useAppSelector((state) => state.novels);

  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    publishingYear: "",
    coverImage: null as File | null,
    synopsis: "",
    status: "ongoing",
    selectedGenres: [] as string[],
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchNovelById(id));
    }
    fetchGenres();
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedNovel && id === selectedNovel.id) {
      setFormData({
        title: selectedNovel.title,
        author: selectedNovel.author.name,
        publisher: selectedNovel.publisher,
        publishingYear: selectedNovel.publishing_year.toString(),
        coverImage: null,
        synopsis: selectedNovel.synopsis,
        status: selectedNovel.status,
        selectedGenres: selectedNovel.genres?.map((genre) => genre.id) || [],
      });
    }
  }, [selectedNovel, id]);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/novels/genres`, {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });
      const data = await response.json();
      setGenres(
        Array.isArray(data.data)
          ? data.data.map((g: Genre) => ({
              id: g.id?.toString() || "",
              name: g.name || "",
              slug: g.slug || "",
            }))
          : []
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to load genres");
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("You do not have permission to access this page");
      router.push("/");
    }
  }, [user, router]);

  if (status === "loading" && !selectedNovel) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        coverImage: file,
      }));
    }
  };

  const handleGenreToggle = (genreId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genreId)
        ? prev.selectedGenres.filter((id) => id !== genreId)
        : [...prev.selectedGenres, genreId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.role !== "admin") {
      toast.error("You do not have permission to perform this action");
      return;
    }

    if (formData.selectedGenres.length === 0) {
      toast.error("Please select at least one genre");
      return;
    }

    const publishingYear = parseInt(formData.publishingYear);
    if (
      isNaN(publishingYear) ||
      publishingYear < 1800 ||
      publishingYear > new Date().getFullYear() + 1
    ) {
      toast.error("Please enter a valid publishing year");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("author", formData.author);
      formDataToSend.append("publisher", formData.publisher);
      formDataToSend.append("publishing_year", formData.publishingYear);
      formDataToSend.append("synopsis", formData.synopsis);
      formDataToSend.append("status", formData.status);
      formData.selectedGenres.forEach((genreId) =>
        formDataToSend.append("genres[]", genreId)
      );
      if (formData.coverImage) {
        formDataToSend.append("cover_image", formData.coverImage);
      }

      await dispatch(updateNovel({ id, data: formDataToSend })).unwrap();

      toast.success("Novel updated successfully");
      router.push("/admin/novels");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update novel");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/admin/novels")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Novels
          </button>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
                <h1 className="text-2xl font-serif font-bold text-gray-900">
                  Edit Novel
                </h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="author"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  required
                  value={formData.author}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, author: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="publisher"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Publisher
                </label>
                <input
                  type="text"
                  id="publisher"
                  required
                  value={formData.publisher}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      publisher: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="publishingYear"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Publishing Year
                </label>
                <input
                  type="number"
                  id="publishingYear"
                  required
                  min="1800"
                  max={new Date().getFullYear() + 1}
                  value={formData.publishingYear}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      publishingYear: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-44 bg-gray-100 rounded-lg overflow-hidden">
                    {formData.coverImage ? (
                      <div className="w-full h-full relative">
                        {/* <Image
                          src={URL.createObjectURL(formData.coverImage)}
                          alt="Cover preview"
                          fill
                          className="object-cover"
                          unoptimized
                        /> */}
                      </div>
                    ) : selectedNovel?.cover_image_url ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={selectedNovel.cover_image_url}
                          alt="Current cover"
                          fill
                          className="object-cover"
                          unoptimized={
                            !selectedNovel.cover_image_url.startsWith("http")
                          }
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Upload className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="cover-image"
                    />
                    <label
                      htmlFor="cover-image"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New Cover
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      Max size: 2MB. Formats: PNG, JPEG, WebP
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genres (Select multiple)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {genres.map((genre) => (
                    <label
                      key={genre.id}
                      className="relative flex items-start p-3 rounded-lg border cursor-pointer focus:outline-none"
                    >
                      <div className="min-w-0 flex-1 text-sm">
                        <div className="font-medium text-gray-700">
                          {genre.name}
                        </div>
                      </div>
                      <div className="ml-3 flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={formData.selectedGenres.includes(genre.id)}
                          onChange={() => handleGenreToggle(genre.id)}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="synopsis"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Synopsis
                </label>
                <textarea
                  id="synopsis"
                  required
                  rows={6}
                  value={formData.synopsis}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      synopsis: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Write a compelling description of the novel..."
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  isLoading={isLoading}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNovelPage;
