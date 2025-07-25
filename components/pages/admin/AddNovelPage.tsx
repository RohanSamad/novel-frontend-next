"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Upload, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { createNovel } from "../../../store/slices/novelsSlice";
import Button from "../../ui/Button";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../ui/LoadingSpinner";
import Image from "next/image";

interface Genre {
  id: string;
  name: string;
  slug: string;
}

const AddNovelPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { status } = useAppSelector((state) => state.novels); // No need for selectedNovel
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    publishingYear: new Date().getFullYear().toString(),
    coverImage: null as File | null,
    synopsis: "",
    status: "ongoing",
    selectedGenres: [] as string[],
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await fetch(
        "https://development.mitprogrammer.com/novel/public/api/novels/genres",
        {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );
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

  // Redirect if not admin
  if (!user || user.role !== "admin") {
    toast.error("You do not have permission to access this page");
    router.push("/");
  }

  if (status === "loading") {
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
      if (!formData.coverImage) {
        throw new Error("Please select a cover image");
      }

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
      formDataToSend.append("cover_image", formData.coverImage);

      await dispatch(createNovel(formDataToSend)).unwrap();

      toast.success("Novel added successfully");
      router.push("/admin/novels");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add novel");
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
                  Add New Novel
                </h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-44 bg-gray-100 rounded-lg overflow-hidden">
                    {formData.coverImage ? (
                      <Image
                        src={URL.createObjectURL(formData.coverImage)}
                        alt="Cover preview"
                        fill
                        style={{
                          objectFit: "cover",
                        }}
                        unoptimized={true}
                      />
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
                      Upload Cover
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      Max size: 2MB. Formats: PNG, JPEG, WebP
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
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

              {/* Author */}
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

              {/* Publisher */}
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

              {/* Publishing Year */}
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

              {/* Status */}
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

              {/* Genres */}
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

              {/* Synopsis */}
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

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  isLoading={isLoading}
                >
                  Add Novel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNovelPage;
