'use client'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Novel } from './novelsSlice';

export type FeaturedNovel = {
  id: string;
  novel_id: string;
  position: number;
  start_date: string;
  end_date: string;
  novel?: Novel;
};

interface FeaturedState {
  featuredNovels: FeaturedNovel[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FeaturedState = {
  featuredNovels: [],
  status: 'idle',
  error: null,
};

const API_BASE_URL =  `${process.env.NEXT_PUBLIC_API_URL}`;

// export const fetchFeaturedNovels = createAsyncThunk(
//   'featured/fetchFeaturedNovels',
//   async (_, { rejectWithValue }) => {
//     try {
     

//       const response = await axios.get(`${API_BASE_URL}/api/featured-novels`, {
//         headers: {
//           Accept: 'application/json',
//           'X-Requested-With': 'XMLHttpRequest',
//         },
//       });

//       console.log('Fetch featured novels response:', response.data);

//       const featuredNovels = Array.isArray(response.data.data) ? response.data.data : [];
//       return featuredNovels.map((featured: any): FeaturedNovel => ({
//         id: featured.id?.toString() || '',
//         novel_id: featured.novel_id?.toString() || '',
//         position: featured.position || 0,
//         start_date: featured.start_date || '',
//         end_date: featured.end_date || '',
//         novel: featured.novel
//           ? {
//               id: featured.novel.id?.toString() || '',
//               title: featured.novel.title || '',
//               author_id: featured.novel.author_id?.toString() || '',
//               author: {
//                 id: featured.novel.author?.id?.toString() || '',
//                 name: featured.novel.author?.name || ''
               
//               },
//               publisher: featured.novel.publisher || '',
//               cover_image_url: featured.novel.cover_image_url || '',
//               synopsis: featured.novel.synopsis || '',
//               status: featured.novel.status || '',
//               publishing_year: featured.novel.publishing_year || 0,
//               created_at: featured.novel.created_at || '',
//               updated_at: featured.novel.updated_at || '',
//             }
//           : undefined,
//       }));
//     } catch (error: any) {
//       console.error('Fetch featured novels error:', error.response || error);
//       return rejectWithValue(
//         error.response?.data?.message || error.message || 'Failed to fetch featured novels'
//       );
//     }
//   }
// );
export const fetchFeaturedNovels = createAsyncThunk(
  'featured/fetchFeaturedNovels',
  async (_, { rejectWithValue }) => {
    try {
      // ✅ Prevent SSR (Next.js server-side execution)
      if (typeof window === 'undefined') {
        console.warn('Skipping fetchFeaturedNovels on server (SSR)');
        return [];
      }

      const response = await axios.get(`${API_BASE_URL}/api/featured-novels`, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      // console.log('Fetch featured novels response:', response.data);

      const featuredNovels = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      return featuredNovels.map((featured: any): FeaturedNovel => ({
        id: featured.id?.toString() || '',
        novel_id: featured.novel_id?.toString() || '',
        position: featured.position || 0,
        start_date: featured.start_date || '',
        end_date: featured.end_date || '',
        novel: featured.novel
          ? {
              id: featured.novel.id?.toString() || '',
              title: featured.novel.title || '',
              author_id: featured.novel.author_id?.toString() || '',
              author: {
                id: featured.novel.author?.id?.toString() || '',
                name: featured.novel.author?.name || '',
              },
              publisher: featured.novel.publisher || '',
              cover_image_url: featured.novel.cover_image_url || '',
              synopsis: featured.novel.synopsis || '',
              status: featured.novel.status || '',
              publishing_year: featured.novel.publishing_year || 0,
              created_at: featured.novel.created_at || '',
              updated_at: featured.novel.updated_at || '',
            }
          : undefined,
      }));
    } catch (error: any) {
      console.error('Fetch featured novels error:', error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch featured novels'
      );
    }
  }
);



export const addFeaturedNovel = createAsyncThunk(
  'featured/addFeaturedNovel',
  async (
    {
      novelId,
      position,
      startDate,
      endDate,
    }: {
      novelId: string;
      position: number;
      startDate: string;
      endDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const formData = new FormData();
      formData.append('novel_id', novelId);
      formData.append('position', position.toString());
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);

      const response = await axios.post(`${API_BASE_URL}/api/featured-novels`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      // console.log('Add featured novel response:', response.data);

      const addedFeatured = response.data.data;
      if (!addedFeatured || !addedFeatured.id) {
        throw new Error('No data returned from insert');
      }

      return {
        id: addedFeatured.id.toString(),
        novel_id: addedFeatured.novel_id.toString(),
        position: addedFeatured.position || 0,
        start_date: addedFeatured.start_date || '',
        end_date: addedFeatured.end_date || '',
        novel: addedFeatured.novel
          ? {
              id: addedFeatured.novel.id?.toString() || '',
              title: addedFeatured.novel.title || '',
              author_id: addedFeatured.novel.author_id?.toString() || '',
              author: {
                id: addedFeatured.novel.author?.id?.toString() || '',
                name: addedFeatured.novel.author?.name || '',
                toString: function () {
                  return this.name;
                },
              },
              publisher: addedFeatured.novel.publisher || '',
              cover_image_url: addedFeatured.novel.cover_image_url || '',
              synopsis: addedFeatured.novel.synopsis || '',
              status: addedFeatured.novel.status || '',
              publishing_year: addedFeatured.novel.publishing_year || 0,
              created_at: addedFeatured.novel.created_at || '',
              updated_at: addedFeatured.novel.updated_at || '',
            }
          : undefined,
      } as FeaturedNovel;
    } catch (error: any) {
      console.error('Add featured novel error:', error.response || error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add featured novel'
      );
    }
  }
);

export const removeFeaturedNovel = createAsyncThunk(
  'featured/removeFeaturedNovel',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.delete(`${API_BASE_URL}/api/featured-novels/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // console.log('Remove featured novel response:', response.data);

      if (response.data.message !== 'Featured novel removed successfully') {
        throw new Error('Remove operation failed');
      }

      return id;
    } catch (error: any) {
      console.error('Remove featured novel error:', error.response || error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to remove featured novel'
      );
    }
  }
);

const featuredSlice = createSlice({
  name: 'featured',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedNovels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFeaturedNovels.fulfilled, (state, action: PayloadAction<FeaturedNovel[]>) => {
        state.status = 'succeeded';
        state.featuredNovels = action.payload;
      })
      .addCase(fetchFeaturedNovels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addFeaturedNovel.fulfilled, (state, action: PayloadAction<FeaturedNovel>) => {
        state.featuredNovels.push(action.payload);
      })
      .addCase(removeFeaturedNovel.fulfilled, (state, action: PayloadAction<string>) => {
        state.featuredNovels = state.featuredNovels.filter(
          featured => featured.id !== action.payload
        );
      });
  },
});

export default featuredSlice.reducer;