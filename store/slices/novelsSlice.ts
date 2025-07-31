'use client'
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Novel {
  id: string;
  title: string;
  author_id: string;
  author: {
    id: string;
    name: string;
  };
  publisher: string;
  cover_image_url: string;
  synopsis: string;
  status: string;
  publishing_year: number;
  genres?: Genre[];
  created_at: string;
  updated_at: string;
}
export interface Chapter {
  id: number;
  title: string;
  chapter_number: number;
  novel_title: string;
  created_at: string;
}


interface NovelsState {
  novels: Novel[];
  filteredNovels: Novel[];
  selectedNovel: Novel | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: NovelsState = {
  novels: [],
  filteredNovels: [],
  selectedNovel: null,
  status: "idle",
  error: null,
};

// Use Vite environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

   
export const fetchNovels = createAsyncThunk(
  "novels/fetchNovels",
  async (_, { rejectWithValue }) => {
    try {
      // ✅ Prevent SSR from calling the API
      if (typeof window === "undefined") {
        console.warn("Skipping fetchNovels during SSR");
        return [];
      }

      const response = await axios.get(`${API_BASE_URL}/api/novels`, {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      // console.log("Fetch novels response:", response.data);

      const novels = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      return novels.map(
        (novel: any): Novel => ({
          id: novel.id?.toString() || "",
          title: novel.title || "",
          author_id: novel.author_id?.toString() || "",
          author: {
            id: novel.author?.id?.toString() || "",
            name: novel.author?.name || "",
          },
          publisher: novel.publisher || "",
          cover_image_url: novel.cover_image_url || "",
          synopsis: novel.synopsis || "",
          status: novel.status || "",
          publishing_year: novel.publishing_year || 0,
          genres: Array.isArray(novel.genres)
            ? novel.genres.map((genre: any) => ({
                id: genre.id?.toString() || "",
                name: genre.name || "",
                slug: genre.slug || "",
              }))
            : [],
          created_at: novel.created_at || "",
          updated_at: novel.updated_at || "",
        })
      );
    } catch (error: any) {
      console.error("Fetch novels error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch novels"
      );
    }
  }
);


export const fetchNovelById = createAsyncThunk(
  "novels/fetchNovelById",
  async (id: string, { rejectWithValue }) => {
    // console.log("Fetching novel by ID:", id); // Add this

    try {
      const response = await axios.get(`${API_BASE_URL}/api/novels/${id}`, {
        headers: {
          Accept: "application/json",
        },
      });

      // console.log("Fetch novel by ID response:", response.data);

      const novel = response.data.data;

      if (!novel || !novel.id) {
        return rejectWithValue("Novel not found");
      }

      return {
        id: novel.id.toString(),
        title: novel.title || "",
        author_id: novel.author_id?.toString() || "",
        author: {
          id: novel.author?.id?.toString() || "",
          name: novel.author?.name || "",
        },
        publisher: novel.publisher || "",
        cover_image_url: novel.cover_image_url || "",
        synopsis: novel.synopsis || "",
        status: novel.status || "",
        publishing_year: novel.publishing_year || 0,
        genres: Array.isArray(novel.genres)
          ? novel.genres.map((genre: any) => ({
              id: genre.id?.toString() || "",
              name: genre.name || "",
              slug: genre.slug || "",
            }))
          : [],
        created_at: novel.created_at || "",
        updated_at: novel.updated_at || "",
      } as Novel;
    } catch (error: any) {
      console.error("Fetch novel by ID error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch novel"
      );
    }
  }
);

export const fetchNovelsByAuthorId = createAsyncThunk(
  "novels/fetchNovelsByAuthorId",
  async (authorId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/novels/author/${authorId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      // console.log("Fetch novels by author response:", response.data);

      const novels = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      return novels.map(
        (novel: any): Novel => ({
          id: novel.id?.toString() || "",
          title: novel.title || "",
          author_id: novel.author_id?.toString() || "",
          author: {
            id: novel.author?.id?.toString() || "",
            name: novel.author?.name || "",
          },
          publisher: novel.publisher || "",
          cover_image_url: novel.cover_image_url || "",
          synopsis: novel.synopsis || "",
          status: novel.status || "",
          publishing_year: novel.publishing_year || 0,
          genres: Array.isArray(novel.genres)
            ? novel.genres.map((genre: any) => ({
                id: genre.id?.toString() || "",
                name: genre.name || "",
                slug: genre.slug || "",
              }))
            : [],
          created_at: novel.created_at || "",
          updated_at: novel.updated_at || "",
        })
      );
    } catch (error: any) {
      console.error("Fetch novels by author error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch novels by author"
      );
    }
  }
);

export const deleteNovel = createAsyncThunk(
  "novels/deleteNovel",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const formData = new FormData();
      formData.append("novelId", id);

      const response = await axios.delete(`${API_BASE_URL}/api/novels/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      // console.log("Delete novel response:", response.data);

      // const { novelId } = response.data;

      return "novelId";
    } catch (error: any) {
      console.error("Delete novel error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete novel"
      );
    }
  }
);

export const searchNovels = createAsyncThunk(
  "novels/searchNovels",
  async (q: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/novels/search`, {
        params: { q },
        headers: {
          Accept: "application/json",
        },
      });

      // console.log("Search novels response:", response.data);

      const novels = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      return novels.map(
        (novel: any): Novel => ({
          id: novel.id?.toString() || "",
          title: novel.title || "",
          author_id: novel.author_id?.toString() || "",
          author: {
            id: novel.author?.id?.toString() || "",
            name: novel.author?.name || "",
          },
          publisher: novel.publisher || "",
          cover_image_url: novel.cover_image_url || "",
          synopsis: novel.synopsis || "",
          status: novel.status || "",
          publishing_year: novel.publishing_year || 0,
          genres: Array.isArray(novel.genres)
            ? novel.genres.map((genre: any) => ({
                id: genre.id?.toString() || "",
                name: genre.name || "",
                slug: genre.slug || "",
              }))
            : [],
          created_at: novel.created_at || "",
          updated_at: novel.updated_at || "",
        })
      );
    } catch (error: any) {
      console.error("Search novels error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to search novels"
      );
    }
  }
);

export const filterNovelsByGenre = createAsyncThunk(
  "novels/filterNovelsByGenre",
  async (genreSlug: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/novels/genre/${genreSlug}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      // console.log("Filter novels by genre response:", response.data);

      const novels = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      return novels.map(
        (novel: any): Novel => ({
          id: novel.id?.toString() || "",
          title: novel.title || "",
          author_id: novel.author_id?.toString() || "",
          author: {
            id: novel.author?.id?.toString() || "",
            name: novel.author?.name || "",
          },
          publisher: novel.publisher || "",
          cover_image_url: novel.cover_image_url || "",
          synopsis: novel.synopsis || "",
          status: novel.status || "",
          publishing_year: novel.publishing_year || 0,
          genres: Array.isArray(novel.genres)
            ? novel.genres.map((genre: any) => ({
                id: genre.id?.toString() || "",
                name: genre.name || "",
                slug: genre.slug || "",
              }))
            : [],
          created_at: novel.created_at || "",
          updated_at: novel.updated_at || "",
        })
      );
    } catch (error: any) {
      console.error("Filter novels by genre error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to filter novels by genre"
      );
    }
  }
);

export const updateNovel = createAsyncThunk(
  "novels/updateNovel",
  async (payload: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/novels/${payload.id}`,
        payload.data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log("Update novel response:", response.data);

      const updatedNovel = response.data.data;

      return {
        id: updatedNovel.id.toString(),
        title: updatedNovel.title || "",
        author_id: updatedNovel.author_id?.toString() || "",
        author: {
          id: updatedNovel.author?.id?.toString() || "",
          name: updatedNovel.author?.name || "",
        },
        publisher: updatedNovel.publisher || "",
        cover_image_url: updatedNovel.cover_image_url || "",
        synopsis: updatedNovel.synopsis || "",
        status: updatedNovel.status || "",
        publishing_year: updatedNovel.publishing_year || 0,
        genres: Array.isArray(updatedNovel.genres)
          ? updatedNovel.genres.map((genre: any) => ({
              id: genre.id?.toString() || "",
              name: genre.name || "",
              slug: genre.slug || "",
            }))
          : [],
        created_at: updatedNovel.created_at || "",
        updated_at: updatedNovel.updated_at || "",
      } as Novel;
    } catch (error: any) {
      console.error("Update novel error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update novel"
      );
    }
  }
);

export const createNovel = createAsyncThunk(
  "novels/createNovel",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(`${API_BASE_URL}/api/novels`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("Create novel response:", response.data);

      const createdNovel = response.data.data;

      return {
        id: createdNovel.id.toString(),
        title: createdNovel.title || "",
        author_id: createdNovel.author_id?.toString() || "",
        author: {
          id: createdNovel.author?.id?.toString() || "",
          name: createdNovel.author?.name || "",
        },
        publisher: createdNovel.publisher || "",
        cover_image_url: createdNovel.cover_image_url || "",
        synopsis: createdNovel.synopsis || "",
        status: createdNovel.status || "",
        publishing_year: createdNovel.publishing_year || 0,
        genres: Array.isArray(createdNovel.genres)
          ? createdNovel.genres.map((genre: any) => ({
              id: genre.id?.toString() || "",
              name: genre.name || "",
              slug: genre.slug || "",
            }))
          : [],
        created_at: createdNovel.created_at || "",
        updated_at: createdNovel.updated_at || "",
      } as Novel;
    } catch (error: any) {
      console.error("Create novel error:", error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create novel"
      );
    }
  }
);

const novelsSlice = createSlice({
  name: "novels",
  initialState,
  reducers: {
    clearSelectedNovel: (state) => {
      state.selectedNovel = null;
    },
    resetFilters: (state) => {
      state.filteredNovels = state.novels;
    },
    setFilteredNovels: (state, action: PayloadAction<Novel[]>) => {
      state.filteredNovels = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNovels.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchNovels.fulfilled,
        (state, action: PayloadAction<Novel[]>) => {
          state.status = "succeeded";
          state.novels = action.payload;
          state.filteredNovels = action.payload;
        }
      )
      .addCase(fetchNovels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchNovelById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchNovelById.fulfilled,
        (state, action: PayloadAction<Novel>) => {
          state.status = "succeeded";
          state.selectedNovel = action.payload;
        }
      )
      .addCase(fetchNovelById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchNovelsByAuthorId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchNovelsByAuthorId.fulfilled,
        (state, action: PayloadAction<Novel[]>) => {
          state.status = "succeeded";
          state.filteredNovels = action.payload;
        }
      )
      .addCase(fetchNovelsByAuthorId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(
        deleteNovel.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.novels = state.novels.filter(
            (novel) => novel.id !== action.payload
          );
          state.filteredNovels = state.filteredNovels.filter(
            (novel) => novel.id !== action.payload
          );
          if (state.selectedNovel?.id === action.payload) {
            state.selectedNovel = null;
          }
        }
      )
      .addCase(deleteNovel.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(searchNovels.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        searchNovels.fulfilled,
        (state, action: PayloadAction<Novel[]>) => {
          state.status = "succeeded";
          state.filteredNovels = action.payload;
        }
      )
      .addCase(searchNovels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(filterNovelsByGenre.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        filterNovelsByGenre.fulfilled,
        (state, action: PayloadAction<Novel[]>) => {
          state.status = "succeeded";
          state.filteredNovels = action.payload;
        }
      )
      .addCase(filterNovelsByGenre.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedNovel, resetFilters, setFilteredNovels } =
  novelsSlice.actions;
export default novelsSlice.reducer;
