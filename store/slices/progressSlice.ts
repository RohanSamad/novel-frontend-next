import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/supabase';


export type UserProgress = Database['public']['Tables']['user_progress']['Row'];

interface ProgressState {
  userProgress: Record<string, UserProgress>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProgressState = {
  userProgress: {},
  status: 'idle',
  error: null,
};

export const fetchUserProgress = createAsyncThunk( 
  'progress/fetchUserProgress',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Convert array to record object with novel_id-chapter_id as key
      const progressRecord: Record<string, UserProgress> = {};
      data.forEach(progress => {
        const key = `${progress.novel_id}-${progress.chapter_id}`;
        progressRecord[key] = progress;
      });

      return progressRecord;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveUserProgress = createAsyncThunk(
  'progress/saveUserProgress',
  async (progress: Database['public']['Tables']['user_progress']['Insert'], { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert([progress], {
          onConflict: 'user_id,novel_id,chapter_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from progress save');

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    updateLocalProgress: (state, action: PayloadAction<UserProgress>) => {
      const { novel_id, chapter_id } = action.payload;
      const progressKey = `${novel_id}-${chapter_id}`;
      state.userProgress[progressKey] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProgress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProgress.fulfilled, (state, action: PayloadAction<Record<string, UserProgress>>) => {
        state.status = 'succeeded';
        state.userProgress = action.payload;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(saveUserProgress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveUserProgress.fulfilled, (state, action: PayloadAction<UserProgress>) => {
        state.status = 'succeeded';
        const { novel_id, chapter_id } = action.payload;
        const progressKey = `${novel_id}-${chapter_id}`;
        state.userProgress[progressKey] = action.payload;
      })
      .addCase(saveUserProgress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { updateLocalProgress } = progressSlice.actions;
export default progressSlice.reducer;