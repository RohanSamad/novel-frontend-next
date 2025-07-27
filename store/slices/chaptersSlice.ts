import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export type Chapter = {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  audio_url: string;
  content_text: string;
  order_index: number;
  created_at: string;
  //updated_at: string;
};

export interface RecentChapter extends Chapter {
  novel_title: string;
}

interface ChaptersState {
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  recentChapters: RecentChapter[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ChaptersState = {
  chapters: [],
  selectedChapter: null,
  recentChapters: [],
  status: "idle",
  error: null,
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL;

export const fetchChaptersByNovelId = createAsyncThunk(
  "chapters/fetchChaptersByNovelId",
  async (novelId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/chapters/novel/${novelId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      // console.log("Fetch chapters by novel ID response:", response.data);

      const chapters = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      return chapters.map(
        (chapter: any): Chapter => ({
          id: chapter.id?.toString() || "",
          novel_id: chapter.novel_id?.toString() || "",
          chapter_number: chapter.chapter_number || 0,
          title: chapter.title || "",
          audio_url: chapter.audio_url || "",
          content_text: chapter.content_text || "",
          order_index: chapter.order_index || 0,
          created_at: chapter.created_at || "",
          //updated_at: chapter.updated_at || '',
        })
      );
    } catch (error: any) {
      console.error(
        "Fetch chapters by novel ID error:",
        error.response || error
      );
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch chapters"
      );
    }
  }
);

export const fetchChapterById = createAsyncThunk(
  "chapters/fetchChapterById",
  async (
    { novelId, chapterId }: { novelId: string; chapterId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/chapters/novel/${novelId}/${chapterId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      // console.log("Fetch chapter by ID response:", response.data);

      const chapter = response.data.data;
      if (!chapter || !chapter.id) {
        return rejectWithValue("Chapter not found");
      }

      return {
        id: chapter.id.toString(),
        novel_id: chapter.novel_id.toString(),
        chapter_number: chapter.chapter_number || 0,
        title: chapter.title || "",
        audio_url: chapter.audio_url || "",
        content_text: chapter.content_text || "",
        order_index: chapter.order_index || 0,
        created_at: chapter.created_at || "",
        updated_at: chapter.updated_at || "",
      } as Chapter;
    } catch (error: any) {
      console.error("Fetch chapter by ID error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch chapter"
      );
    }
  }
);

export const fetchRecentChapters = createAsyncThunk(
  "chapters/fetchRecentChapters",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chapters/recent`, {
        headers: {
          Accept: "application/json",
        },
      });

      // console.log("Fetch recent chapters response:", response.data);

      const chapters = Array.isArray(response.data) ? response.data : [];
      return chapters.map(
        (chapter: any): RecentChapter => ({
          id: chapter.id?.toString() || "",
          novel_id: chapter.novel_id?.toString() || "",
          chapter_number: chapter.chapter_number || 0,
          title: chapter.title || "",
          audio_url: chapter.audio_url || "",
          content_text: chapter.content_text || "",
          order_index: chapter.order_index || 0,
          created_at: chapter.created_at || "",
          // updated_at: chapter.updated_at || '',
          novel_title: chapter.novel_title || "",
        })
      );
    } catch (error: any) {
      console.error("Fetch recent chapters error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch recent chapters"
      );
    }
  }
);

export const addChapter = createAsyncThunk(
  "chapters/addChapter",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/chapters`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      // console.log("Add chapter response:", response.data);

      const addedChapter = response.data.data;
      if (!addedChapter || !addedChapter.id) {
        throw new Error("No data returned from insert");
      }

      return {
        id: addedChapter.id.toString(),
        novel_id: addedChapter.novel_id.toString(),
        chapter_number: addedChapter.chapter_number || 0,
        title: addedChapter.title || "",
        audio_url: addedChapter.audio_url || "",
        content_text: addedChapter.content_text || "",
        order_index: addedChapter.order_index || 0,
        created_at: addedChapter.created_at || "",
      } as Chapter;
    } catch (error: any) {
      console.error("Add chapter error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to add chapter"
      );
    }
  }
);

export const updateChapter = createAsyncThunk(
  "chapters/updateChapter",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const chapterId = formData.get("id")?.toString();
      if (!chapterId) {
        return rejectWithValue("Chapter ID is required");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/chapters/${chapterId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      // console.log("Update chapter response:", response.data);

      const updatedChapter = response.data.data;
      if (!updatedChapter || !updatedChapter.id) {
        throw new Error("No data returned from update");
      }

      return {
        id: updatedChapter.id.toString(),
        novel_id: updatedChapter.novel_id.toString(),
        chapter_number: updatedChapter.chapter_number || 0,
        title: updatedChapter.title || "",
        audio_url: updatedChapter.audio_url || "",
        content_text: updatedChapter.content_text || "",
        order_index: updatedChapter.order_index || 0,
        created_at: updatedChapter.created_at || "",
      } as Chapter;
    } catch (error: any) {
      console.error("Update chapter error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update chapter"
      );
    }
  }
);

export const deleteChapter = createAsyncThunk(
  "chapters/deleteChapter",
  async (chapterId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.delete(
        `${API_BASE_URL}/api/chapters/${chapterId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      // console.log("Delete chapter response:", response.data);

      if (response.data.message !== "Chapter deleted successfully") {
        throw new Error("Delete operation failed");
      }

      return chapterId;
    } catch (error: any) {
      console.error("Delete chapter error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete chapter"
      );
    }
  }
);

const chaptersSlice = createSlice({
  name: "chapters",
  initialState,
  reducers: {
    clearSelectedChapter: (state) => {
      state.selectedChapter = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChaptersByNovelId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchChaptersByNovelId.fulfilled,
        (state, action: PayloadAction<Chapter[]>) => {
          state.status = "succeeded";
          state.chapters = action.payload;
        }
      )
      .addCase(fetchChaptersByNovelId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchChapterById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchChapterById.fulfilled,
        (state, action: PayloadAction<Chapter>) => {
          state.status = "succeeded";
          state.selectedChapter = action.payload;
        }
      )
      .addCase(fetchChapterById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchRecentChapters.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchRecentChapters.fulfilled,
        (state, action: PayloadAction<RecentChapter[]>) => {
          state.status = "succeeded";
          state.recentChapters = action.payload;
        }
      )
      .addCase(fetchRecentChapters.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(
        addChapter.fulfilled,
        (state, action: PayloadAction<Chapter>) => {
          state.chapters.push(action.payload);
        }
      )
      .addCase(
        updateChapter.fulfilled,
        (state, action: PayloadAction<Chapter>) => {
          const index = state.chapters.findIndex(
            (chapter) => chapter.id === action.payload.id
          );
          if (index !== -1) {
            state.chapters[index] = action.payload;
          }
        }
      )
      .addCase(
        deleteChapter.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.chapters = state.chapters.filter(
            (chapter) => chapter.id !== action.payload
          );
        }
      );
  },
});

export const { clearSelectedChapter } = chaptersSlice.actions;
export default chaptersSlice.reducer;
