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
  const { status } = useAppSelector((state) => state.novels);
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);
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

  // Handle permission check in useEffect
  useEffect(() => {
    if (user !== undefined) {
      if (!user || user.role !== "admin") {
        toast.error("You do not have permission to access this page");
        router.push("/");
        return;
      }
      setHasCheckedPermission(true);
    }
  }, [user, router]);

  useEffect(() => {
    if (hasCheckedPermission) {
      fetchGenres();
    }
  }, [hasCheckedPermission]);

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

  // Show loading while checking permissions or if status is loading
  if (!hasCheckedPermission || status === "loading") {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("🖼️ === FILE SELECTION DEBUG START ===");
    console.log("1. Event triggered:", e.type);
    console.log("2. Input element:", e.target);
    console.log("3. Files property:", e.target.files);

    if (!e.target.files || e.target.files.length === 0) {
      console.log("❌ No files selected");
      setFormData((prev) => ({ ...prev, coverImage: null }));
      return;
    }

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const result = event.target?.result;
      if (result) {
        console.log(
          "✅ File is readable, data length:",
          typeof result === "string" ? result.length : result.byteLength
        );
      } else {
        console.log("❌ File read but no result");
      }
    };
    reader.onerror = function (error) {
      console.log("❌ File read error:", error);
    };
    reader.readAsDataURL(file);

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      console.error("❌ Invalid file type:", file.type);
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      console.error("❌ File too large:", file.size);
      e.target.value = "";
      return;
    }

    if (file.size === 0) {
      toast.error("Selected file is empty");
      console.error("❌ Empty file selected");
      e.target.value = "";
      return;
    }

    console.log("7. Setting file in state...");
    setFormData((prev) => {
      const newState = { ...prev, coverImage: file };
      console.log("8. New state coverImage:", newState.coverImage);
      return newState;
    });

    console.log("🖼️ === FILE SELECTION DEBUG END ===");
  };

  // Add this button to your form (temporarily):

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

    console.log("🚀 === FORM SUBMISSION DEBUG START ===");
    console.log("1. Form data state:", formData);
    console.log("2. Cover image from state:", formData.coverImage);

    if (formData.coverImage) {
      console.log("3. Cover image details from state:", {
        name: formData.coverImage.name,
        size: formData.coverImage.size,
        type: formData.coverImage.type,
        lastModified: formData.coverImage.lastModified,
        constructor: formData.coverImage.constructor.name,
      });

      // Test if the file is still readable
      console.log("4. Testing if file is still readable...");
      try {
        const reader = new FileReader();
        const readPromise = new Promise((resolve, reject) => {
          reader.onload = () => {
            console.log("✅ File still readable from state");
            resolve(true);
          };
          reader.onerror = () => {
            console.log("❌ File no longer readable from state");
            reject(false);
          };
        });
        reader.readAsDataURL(formData.coverImage);
        await readPromise;
      } catch (error) {
        console.log("❌ File read test failed:", error);
      }
    } else {
      console.log("❌ No cover image in state!");
      toast.error("Please select a cover image");
      return;
    }

    // ... your existing validation code ...
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
      console.log("5. Creating FormData...");
      const formDataToSend = new FormData();

      // Add text fields
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("author", formData.author.trim());
      formDataToSend.append("publisher", formData.publisher.trim());
      formDataToSend.append("publishing_year", formData.publishingYear);
      formDataToSend.append("synopsis", formData.synopsis.trim());
      formDataToSend.append("status", formData.status);

      // Add genres
      formData.selectedGenres.forEach((genreId) =>
        formDataToSend.append("genres[]", genreId)
      );

      console.log("6. About to append file to FormData...");
      console.log("   File object before append:", formData.coverImage);

      // Append file
      formDataToSend.append(
        "cover_image",
        formData.coverImage,
        formData.coverImage.name
      );

      console.log("7. File appended to FormData");

      // Verify FormData contents
      console.log("8. Checking FormData contents...");
      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`   ${key} (File):`, {
            name: value.name,
            size: value.size,
            type: value.type,
            lastModified: value.lastModified,
          });

          // Test if file in FormData is readable
          const testReader = new FileReader();
          testReader.onload = () => {
            console.log(`   ✅ File ${key} in FormData is readable`);
          };
          testReader.onerror = () => {
            console.log(`   ❌ File ${key} in FormData is NOT readable`);
          };
          testReader.readAsDataURL(value);
        } else {
          console.log(`   ${key}:`, value);
        }
      }

      // Additional verification
      const fileFromFormData = formDataToSend.get("cover_image");
      console.log("9. File retrieved from FormData:", fileFromFormData);
      if (fileFromFormData instanceof File) {
        console.log("   Retrieved file details:", {
          name: fileFromFormData.name,
          size: fileFromFormData.size,
          type: fileFromFormData.type,
        });
      }

      console.log("10. Dispatching createNovel...");
      await dispatch(createNovel(formDataToSend)).unwrap();

      toast.success("Novel added successfully");
      router.push("/admin/novels");
    } catch (error: unknown) {
      console.error("❌ Novel creation failed:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add novel");
      }
    } finally {
      setIsLoading(false);
      console.log("🚀 === FORM SUBMISSION DEBUG END ===");
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
              {/* // Alternative solution using regular img tag: */}
              {/* <button
                type="button"
                onClick={testSimpleUpload}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Test Simple Upload
              </button> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-44 bg-gray-100 rounded-lg overflow-hidden">
                    {formData.coverImage ? (
                      <img
                        src={URL.createObjectURL(formData.coverImage)}
                        alt="Cover preview"
                        className="object-cover w-full h-full"
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
                    {formData.coverImage && (
                      <p className="mt-1 text-xs text-green-600">
                        ✅ {formData.coverImage.name} (
                        {Math.round(formData.coverImage.size / 1024)}KB)
                      </p>
                    )}
                  </div>
                </div>
              </div>

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
                      className={`${
                        formData.selectedGenres.includes(genre.id)
                          ? "border-blue-500"
                          : ""
                      } relative flex items-start p-3 rounded-lg border cursor-pointer focus:outline-none`}
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
                          className="h-4 w-4 text-primary-600 appearance-auto border-gray-300 rounded focus:ring-primary-500"
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
