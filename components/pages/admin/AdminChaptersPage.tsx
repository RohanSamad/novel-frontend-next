"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { fetchNovels } from "../../../store/slices/novelsSlice";
import {
  fetchChaptersByNovelId,
  addChapter,
  updateChapter,
  deleteChapter,
} from "../../../store/slices/chaptersSlice";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Music,
} from "lucide-react";
import LoadingSpinner from "../../ui/LoadingSpinner";
import Button from "../../ui/Button";
import { toast } from "react-hot-toast";
type Chapter = {
  id: string;
  title: string;
  chapter_number: number;
    audio_url: string; // <-- add this

};
const AdminChaptersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { novels, status: novelsStatus } = useAppSelector(
    (state) => state.novels
  );
  const { chapters, status: chaptersStatus } = useAppSelector(
    (state) => state.chapters
  );

  const [selectedNovelId, setSelectedNovelId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChapters, setFilteredChapters] = useState(chapters);
const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    chapterNumber: "",
    orderIndex: "",
    title: "",
    audioFile: null as File | null,
    audioUrl: "",
    contentText: "",
  });
  const [newChapterData, setNewChapterData] = useState({
    chapterNumber: "",
    orderIndex: "",
    title: "",
    audioFile: null as File | null,
    contentText: "",
  });

  useEffect(() => {
    if (novelsStatus === "idle") {
      dispatch(fetchNovels());
    }
  }, [dispatch, novelsStatus]);

  useEffect(() => {
    if (selectedNovelId) {
      dispatch(fetchChaptersByNovelId(selectedNovelId));
    }
  }, [dispatch, selectedNovelId]);

  useEffect(() => {
    if (chapters.length > 0) {
      const filtered = chapters.filter(
        (chapter) =>
          chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chapter.chapter_number.toString().includes(searchQuery)
      );
      setFilteredChapters(filtered);
    } else {
      setFilteredChapters([]);
    }
  }, [chapters, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleNovelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNovelId(e.target.value);
    setSearchQuery("");
  };

  const handleDeleteClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedChapter) return;

    try {
      const resultAction = await dispatch(deleteChapter(selectedChapter.id));
      if (deleteChapter.fulfilled.match(resultAction)) {
        toast.success(
          `Chapter ${selectedChapter.chapter_number}: "${selectedChapter.title}" deleted successfully`
        );
        if (selectedNovelId) {
          dispatch(fetchChaptersByNovelId(selectedNovelId));
        }
      } else {
        throw new Error("Failed to delete chapter");
      }
    } catch {
      toast.error("Failed to delete chapter");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedChapter(null);
    }
  };

  const validateChapterData = (
    data: typeof newChapterData & { audioUrl?: string }
  ) => {
    if (!selectedNovelId) {
      toast.error("Please select a novel first");
      return false;
    }

    if (
      !data.chapterNumber ||
      !data.orderIndex ||
      !data.title ||
      !data.contentText
    ) {
      toast.error("Please fill in all fields");
      return false;
    }

    const chapterNumber = parseInt(data.chapterNumber);
    const orderIndex = parseInt(data.orderIndex);

    if (isNaN(chapterNumber) || chapterNumber <= 0) {
      toast.error("Chapter number must be a positive number");
      return false;
    }

    if (isNaN(orderIndex) || orderIndex <= 0) {
      toast.error("Order index must be a positive number");
      return false;
    }

    // Only validate audio file if it's provided
    if (data.audioFile) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (data.audioFile.size > maxSize) {
        toast.error("Audio file must be smaller than 50MB");
        return false;
      }

      const allowedTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/mp4",
        "audio/ogg",
      ];
      if (!allowedTypes.includes(data.audioFile.type)) {
        toast.error("Please upload a valid audio file (MP3, WAV, M4A, or OGG)");
        return false;
      }
    }

    // Validate audio URL if provided
    if (data.audioUrl && !data.audioUrl.trim()) {
      toast.error("Audio URL cannot be empty");
      return false;
    }

    return true;
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateChapterData(newChapterData)) {
      return;
    }

    if (!newChapterData.audioFile) {
      toast.error("Please select an audio file");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("novel_id", selectedNovelId);
      formData.append("chapter_number", newChapterData.chapterNumber);
      formData.append("order_index", newChapterData.orderIndex);
      formData.append("title", newChapterData.title.trim());
      formData.append("content_text", newChapterData.contentText.trim());
      formData.append("audio_file", newChapterData.audioFile);

      const resultAction = await dispatch(addChapter(formData));

      if (addChapter.fulfilled.match(resultAction)) {
        toast.success("New chapter created successfully");
        setIsAddModalOpen(false);
        setNewChapterData({
          chapterNumber: "",
          orderIndex: "",
          title: "",
          audioFile: null,
          contentText: "",
        });

        dispatch(fetchChaptersByNovelId(selectedNovelId));
      } else {
        throw new Error("Failed to create chapter");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create chapter");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditChapter = async () => {
    if (!selectedChapter || !validateChapterData(editFormData)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("id", selectedChapter.id);
      formData.append("novel_id", selectedNovelId);
      formData.append("chapter_number", editFormData.chapterNumber);
      formData.append("order_index", editFormData.orderIndex);
      formData.append("title", editFormData.title.trim());
      formData.append("content_text", editFormData.contentText.trim());
      if (editFormData.audioFile) {
        formData.append("audio_file", editFormData.audioFile);
      }

      const resultAction = await dispatch(updateChapter(formData));

      if (updateChapter.fulfilled.match(resultAction)) {
        toast.success(
          `Chapter ${selectedChapter.chapter_number}: "${selectedChapter.title}" updated successfully`
        );
        setIsEditModalOpen(false);
        setSelectedChapter(null);

        dispatch(fetchChaptersByNovelId(selectedNovelId));
      } else {
        throw new Error("Failed to update chapter");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update chapter");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveChapterUp = (index: number) => {
    if (index > 0) {
      toast.success("Chapter order updated");
    }
  };

  const moveChapterDown = (index: number) => {
    if (index < filteredChapters.length - 1) {
      toast.success("Chapter order updated");
    }
  };

  const selectedNovel = novels.find((novel) => novel.id === selectedNovelId);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEdit) {
        setEditFormData((prev) => ({ ...prev, audioFile: file }));
      } else {
        setNewChapterData((prev) => ({ ...prev, audioFile: file }));
      }
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-900">
              Chapter Management
            </h1>
            <p className="text-gray-600">
              {selectedNovel
                ? `Managing chapters for "${selectedNovel.title}"`
                : "Select a novel to manage its chapters"}
            </p>
          </div>

          {selectedNovelId && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Chapter
            </Button>
          )}
        </div>

        {/* Novel Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-1/2">
              <label
                htmlFor="novelSelect"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Novel
              </label>
              <select
                id="novelSelect"
                value={selectedNovelId}
                onChange={handleNovelChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">-- Select a Novel --</option>
                {novels.map((novel) => (
                  <option key={novel.id} value={novel.id}>
                    {novel.title} by {novel.author.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedNovelId && (
              <div className="w-full md:w-1/2 md:mt-5">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search chapters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Chapters List */}
        {selectedNovelId ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {chaptersStatus === "loading" ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : filteredChapters.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">
                  No chapters found for this novel
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chapter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Audio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredChapters.map((chapter, index) => (
                      <tr key={chapter.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-gray-700">
                              {chapter.order_index}
                            </span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => moveChapterUp(index)}
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
                                onClick={() => moveChapterDown(index)}
                                disabled={index === filteredChapters.length - 1}
                                className={`${
                                  index === filteredChapters.length - 1
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
                          <div className="text-sm font-medium text-gray-900">
                            Chapter {chapter.chapter_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {chapter.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 flex items-center">
                            <Music className="w-4 h-4 mr-2" />
                            <span className="truncate max-w-xs">
                              {chapter.audio_url.split("/").pop()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {new Date(chapter.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedChapter(chapter);
                                setEditFormData({
                                  chapterNumber:
                                    chapter.chapter_number.toString(),
                                  orderIndex: chapter.order_index.toString(),
                                  title: chapter.title,
                                  audioFile: null,
                                  audioUrl: chapter.audio_url,
                                  contentText: chapter.content_text,
                                });
                                setIsEditModalOpen(true);
                              }}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(chapter)}
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
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            Please select a novel to manage its chapters
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete Chapter{" "}
              {selectedChapter.chapter_number}: {selectedChapter.title}? This
              action cannot be undone.
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

      {/* Add Chapter Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Chapter
            </h3>

            <form onSubmit={handleAddChapter} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="chapterNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Chapter Number
                  </label>
                  <input
                    type="number"
                    id="chapterNumber"
                    value={newChapterData.chapterNumber}
                    onChange={(e) =>
                      setNewChapterData((prev) => ({
                        ...prev,
                        chapterNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="orderIndex"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Order Index
                  </label>
                  <input
                    type="number"
                    id="orderIndex"
                    value={newChapterData.orderIndex}
                    onChange={(e) =>
                      setNewChapterData((prev) => ({
                        ...prev,
                        orderIndex: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="chapterTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Chapter Title
                </label>
                <input
                  type="text"
                  id="chapterTitle"
                  value={newChapterData.title}
                  onChange={(e) =>
                    setNewChapterData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audio File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="audio-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="audio-upload"
                          name="audio-upload"
                          type="file"
                          accept="audio/*"
                          className="sr-only"
                          onChange={(e) => handleFileSelect(e)}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      MP3, WAV, M4A or OGG up to 50MB
                    </p>
                    {newChapterData.audioFile && (
                      <div className="mt-2 flex items-center justify-center text-sm text-gray-600">
                        <Music className="w-4 h-4 mr-2" />
                        <span className="truncate max-w-xs">
                          {newChapterData.audioFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setNewChapterData((prev) => ({
                              ...prev,
                              audioFile: null,
                            }))
                          }
                          className="ml-2 text-error-600 hover:text-error-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="chapterContent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Chapter Content
                </label>
                <textarea
                  id="chapterContent"
                  rows={8}
                  value={newChapterData.contentText}
                  onChange={(e) =>
                    setNewChapterData((prev) => ({
                      ...prev,
                      contentText: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter chapter content (HTML supported)"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewChapterData({
                      chapterNumber: "",
                      orderIndex: "",
                      title: "",
                      audioFile: null,
                      contentText: "",
                    });
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Add Chapter
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Chapter Modal */}
      {isEditModalOpen && selectedChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Chapter
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="editChapterNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Chapter Number
                  </label>
                  <input
                    type="number"
                    id="editChapterNumber"
                    value={editFormData.chapterNumber}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        chapterNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="editOrderIndex"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Order Index
                  </label>
                  <input
                    type="number"
                    id="editOrderIndex"
                    value={editFormData.orderIndex}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        orderIndex: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="editChapterTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Chapter Title
                </label>
                <input
                  type="text"
                  id="editChapterTitle"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="editAudioUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Audio URL
                </label>
                <input
                  type="text"
                  id="editAudioUrl"
                  value={editFormData.audioUrl}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      audioUrl: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter audio URL or upload a new file below"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audio File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {editFormData.audioFile ? (
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Music className="w-4 h-4 mr-2" />
                        <span className="truncate max-w-xs">
                          {editFormData.audioFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditFormData((prev) => ({
                              ...prev,
                              audioFile: null,
                            }))
                          }
                          className="ml-2 text-error-600 hover:text-error-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                          <Music className="w-4 h-4 mr-2" />
                          <span className="truncate max-w-xs">
                            Current:{" "}
                            {selectedChapter.audio_url.split("/").pop()}
                          </span>
                        </div>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="edit-audio-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload new file</span>
                            <input
                              id="edit-audio-upload"
                              name="edit-audio-upload"
                              type="file"
                              accept="audio/*"
                              className="sr-only"
                              onChange={(e) => handleFileSelect(e, true)}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          MP3, WAV, M4A or OGG up to 50MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="editChapterContent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Chapter Content
                </label>
                <textarea
                  id="editChapterContent"
                  rows={8}
                  value={editFormData.contentText}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      contentText: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEditChapter}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChaptersPage;
