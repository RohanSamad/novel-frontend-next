import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Author {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthorsState {
  authors: Author[];
  selectedAuthor: Author | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthorsState = {
  authors: [],
  selectedAuthor: null,
  status: 'idle',
  error: null,
};

// Safely access environment variable with fallback
const API_BASE_URL = typeof process !== 'undefined' && process.env?.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL
  : 'https://development.mitprogrammer.com/novel/public';

export const fetchAuthors = createAsyncThunk(
  'authors/fetchAuthors',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/api/authors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const authors = response.data.data; // Expect { data: [{ id, name, bio, avatar_url, created_at, updated_at }] }

      return authors.map((author : any) => ({
        id: author.id.toString(), // Convert id to string to match Author interface
        name: author.name,
        bio: author.bio,
        avatar_url: author.avatar_url,
        created_at: author.created_at,
        updated_at: author.updated_at,
      })) as Author[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch authors');
    }
  }
);

export const fetchAuthorById = createAsyncThunk(
  'authors/fetchAuthorById',
  async (id: string, { rejectWithValue }) => {
    try {
      // const token = localStorage.getItem('auth_token');
      // if (!token) {
      //   throw new Error('No authentication token found');
      // }

      const response = await axios.get(`${API_BASE_URL}/api/authors/${id}`, {
        headers: {
        //  Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const author = response.data.data; // Expect { data: { id, name, bio, avatar_url, created_at, updated_at } }

      if (!author || !author.id) {
        throw new Error('No author data returned');
      }

      return {
        id: author.id.toString(), // Convert id to string to match Author interface
        name: author.name,
        bio: author.bio,
        avatar_url: author.avatar_url,
        created_at: author.created_at,
        updated_at: author.updated_at,
      } as Author;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch author');
    }
  }
);

const authorsSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {
    clearSelectedAuthor: (state) => {
      state.selectedAuthor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAuthors.fulfilled, (state, action: PayloadAction<Author[]>) => {
        state.status = 'succeeded';
        state.authors = action.payload;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchAuthorById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAuthorById.fulfilled, (state, action: PayloadAction<Author>) => {
        state.status = 'succeeded';
        state.selectedAuthor = action.payload;
      })
      .addCase(fetchAuthorById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedAuthor } = authorsSlice.actions;
export default authorsSlice.reducer;