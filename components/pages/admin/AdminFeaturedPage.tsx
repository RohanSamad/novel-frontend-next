"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { fetchNovels, Novel } from "../../../store/slices/novelsSlice";
import {
  fetchFeaturedNovels,
  addFeaturedNovel,
  removeFeaturedNovel,
} from "../../../store/slices/featuredSlice";
import {
  Search,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calendar,
} from "lucide-react";
import LoadingSpinner from "../../ui/LoadingSpinner";
import Button from "../../ui/Button";
import { toast } from "react-hot-toast";
import NovelCard from "../../novel/NovelCard";
import Image from "next/image";

const AdminFeaturedPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { novels, status: novelsStatus } = useAppSelector(
    (state) => state.novels
  );
  const { featuredNovels, status: featuredStatus } = useAppSelector(
    (state) => state.featured
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (novelsStatus === "idle") {
      dispatch(fetchNovels());
    }
    if (featuredStatus === "idle") {
      dispatch(fetchFeaturedNovels());
    }
  }, [dispatch, novelsStatus, featuredStatus]);

  useEffect(() => {
    if (novels.length > 0) {
      const filtered = novels.filter(
        (novel) =>
          novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          novel.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          novel.genres?.[0]?.name ||
          "No genre".toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Filter out novels that are already featured
      const featuredIds = featuredNovels.map((f) => f.novel_id);
      const notFeatured = filtered.filter(
        (novel) => !featuredIds.includes(novel.id)
      );

      setFilteredNovels(notFeatured);
    }
  }, [novels, searchQuery, featuredNovels]);

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  // };

  const handleAddFeatured = async () => {
    if (!selectedNovel) {
      toast.error("Please select a novel to feature");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsSubmitting(true);

    try {
      const position =
        featuredNovels.length > 0
          ? Math.max(...featuredNovels.map((f) => f.position)) + 1
          : 1;

      const resultAction = await dispatch(
        addFeaturedNovel({
          novelId: selectedNovel.id,
          position,
          startDate,
          endDate,
        })
      );

      if (addFeaturedNovel.fulfilled.match(resultAction)) {
        toast.success(`"${selectedNovel.title}" added to featured novels`);
        setIsAddModalOpen(false);
        setSelectedNovel(null);
        dispatch(fetchFeaturedNovels());
      } else {
        throw new Error("Failed to add featured novel");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add featured novel");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFeatured = async (id: string) => {
    try {
      const resultAction = await dispatch(removeFeaturedNovel(id));
      if (removeFeaturedNovel.fulfilled.match(resultAction)) {
        toast.success("Novel removed from featured list");
        dispatch(fetchFeaturedNovels());
      }
    } catch {
      toast.error("Failed to remove featured novel");
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      toast.success("Featured order updated");
    }
  };

  const moveDown = (index: number) => {
    if (index < featuredNovels.length - 1) {
      toast.success("Featured order updated");
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-900">
              Featured Content
            </h1>
            <p className="text-gray-600">
              Manage which novels appear in the featured carousel
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Featured Novel
          </Button>
        </div>

        {/* Current Featured Novels */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">
              Current Featured Novels
            </h2>
          </div>

          {featuredStatus === "loading" ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : featuredNovels.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No featured novels set</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cover
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {featuredNovels.map((featured, index) => (
                    <tr key={featured.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-gray-700">
                            {featured.position}
                          </span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => moveUp(index)}
                              disabled={index === 0}
                              className={`${
                                index === 0
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 hover:text-primary-600"
                              }`}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveDown(index)}
                              disabled={index === featuredNovels.length - 1}
                              className={`${
                                index === featuredNovels.length - 1
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 hover:text-primary-600"
                              }`}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-16 overflow-hidden rounded">
                          <div className="relative w-full h-full">
                            {" "}
                            {/* Required parent container */}
                            <Image
                              src={
                                featured.novel?.cover_image_url ||
                                "/default-cover.jpg"
                              } // Fallback image
                              alt={featured.novel?.title || "Novel cover"}
                              fill
                              className="object-cover"
                              unoptimized={
                                featured.novel?.cover_image_url?.startsWith(
                                  "http"
                                )
                                  ? false
                                  : true
                              }
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {featured.novel?.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {featured.novel?.author.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(featured.start_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(featured.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleRemoveFeatured(featured.id)}
                          className="text-error-600 hover:text-error-900 flex items-center"
                        >
                          <Trash2 className="w-5 h-5 mr-1" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Featured Novel Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Featured Novel
            </h3>

            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="w-full md:w-2/3">
                  <label
                    htmlFor="searchNovel"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Search Novels
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="searchNovel"
                      placeholder="Search by title, author, or genre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>

                <div className="w-full md:w-1/3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Start Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="startDate"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        End Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="endDate"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-2 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Choose a novel to feature:
                </h4>

                <div className="max-h-64 overflow-y-auto">
                  {filteredNovels.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {searchQuery
                        ? "No matching novels found"
                        : "No novels available to feature"}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {filteredNovels.map((novel) => (
                        <NovelCard
                          key={novel.id}
                          novel={novel}
                          size="small"
                          selectable
                          selected={selectedNovel?.id === novel.id}
                          onSelect={setSelectedNovel}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedNovel(null);
                  setSearchQuery("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddFeatured}
                disabled={!selectedNovel || isSubmitting}
                isLoading={isSubmitting}
              >
                Add to Featured
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeaturedPage;
