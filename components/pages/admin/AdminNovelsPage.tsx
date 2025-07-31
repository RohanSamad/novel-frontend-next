"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchNovels,
  Novel,
  deleteNovel,
} from "../../../store/slices/novelsSlice";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoadingSpinner from "../../ui/LoadingSpinner";
import Button from "../../ui/Button";
import { toast } from "react-hot-toast";
import Image from "next/image";

const AdminNovelsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { novels, status } = useAppSelector((state) => state.novels);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchNovels());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (novels.length > 0) {
      const filtered = novels.filter((novel) => {
        const titleMatch = novel.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const authorMatch = novel.author.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const genreMatch =
          novel.genres?.some((genre) =>
            genre.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) || false; // Fallback to false if no genres
        return titleMatch || authorMatch || genreMatch;
      });
      setFilteredNovels(filtered);
      setCurrentPage(1); // Reset to first page on new search
    } else {
      setFilteredNovels([]);
    }
  }, [novels, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNovels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNovels.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDeleteClick = (novel: Novel) => {
    setSelectedNovel(novel);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedNovel) return;

    try {
      const resultAction = await dispatch(deleteNovel(selectedNovel.id));
      if (deleteNovel.fulfilled.match(resultAction)) {
        toast.success(`Novel "${selectedNovel.title}" deleted successfully`);
        // Refresh the novels list
        dispatch(fetchNovels());
      } else {
        throw new Error("Failed to delete novel");
      }
    } catch {
      toast.error("Failed to delete novel");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedNovel(null);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-900">
              Novel Management
            </h1>
            <p className="text-gray-600">Add, edit, and delete novels</p>
          </div>

          <Link href="/admin/new">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Novel
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search novels by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </form>
        </div>

        {/* Novels Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {status === "loading" ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredNovels.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No novels found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cover
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Genre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((novel) => (
                      <tr key={novel.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-16 overflow-hidden rounded ">
                            <div className="relative w-full h-full">
                              {" "}
                              {/* Required parent container */}
                              <Image
                                src={novel.cover_image_url}
                                alt={novel.title}
                                fill
                                className="object-cover"
                                sizes="100vw"
                                loading="eager"
                                priority
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {novel.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {novel.author.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                            {novel.genres?.[0]?.name || "No genre"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              novel.status === "completed"
                                ? "bg-success-100 text-success-800"
                                : novel.status === "ongoing"
                                ? "bg-primary-100 text-primary-800"
                                : "bg-warning-100 text-warning-800"
                            }`}
                          >
                            {novel.status.charAt(0).toUpperCase() +
                              novel.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/edit/${novel.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(novel)}
                              className="text-error-600 hover:text-error-900"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredNovels.length)} of{" "}
                    {filteredNovels.length} novels
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum =
                        currentPage > 3 ? currentPage - 3 + i + 1 : i + 1;

                      if (pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`px-3 py-1 rounded-md ${
                              currentPage === pageNum
                                ? "bg-primary-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() =>
                        paginate(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedNovel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the novel {selectedNovel.title}?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="error" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNovelsPage;
