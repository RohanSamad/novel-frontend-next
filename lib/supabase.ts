

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const isBrowser = typeof window !== 'undefined';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: isBrowser ? localStorage : undefined, // ✅ SSR-safe
  },
});

if (isBrowser) {
  // ✅ Only runs in browser
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      localStorage.removeItem('supabase.auth.token');
      window.location.reload();
    }
  });
}

// -----------------
// 🗃️ Supabase Types
// -----------------

export type Database = {
  public: {
    Tables: {
      novels: {
        Row: {
          id: string;
          title: string;
          author: string;
          publisher: string;
          cover_image_url: string;
          synopsis: string;
          status: 'completed' | 'ongoing' | 'hiatus';
          genre: string;
          created_at: string;
          updated_at: string;
          novel_genres?: {
            genres: {
              id: string;
              name: string;
              slug: string;
            };
          }[];
        };
        Insert: Omit<Database['public']['Tables']['novels']['Row'], 'id' | 'created_at' | 'updated_at' | 'novel_genres'>;
        Update: Partial<Database['public']['Tables']['novels']['Insert']>;
      };

      genres: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['genres']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['genres']['Insert']>;
      };

      novel_genres: {
        Row: {
          novel_id: string;
          genre_id: string;
        };
        Insert: Database['public']['Tables']['novel_genres']['Row'];
        Update: Partial<Database['public']['Tables']['novel_genres']['Insert']>;
      };

      chapters: {
        Row: {
          id: string;
          novel_id: string;
          chapter_number: number;
          title: string;
          audio_url: string;
          content_text: string;
          order_index: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chapters']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['chapters']['Insert']>;
      };

      user_progress: {
        Row: {
          id: string;
          user_id: string;
          novel_id: string;
          chapter_id: string;
          progress_timestamp: string;
          audio_position: number;
        };
        Insert: Omit<Database['public']['Tables']['user_progress']['Row'], 'id' | 'progress_timestamp'>;
        Update: Partial<Database['public']['Tables']['user_progress']['Insert']>;
      };

      featured_novels: {
        Row: {
          id: string;
          novel_id: string;
          position: number;
          start_date: string;
          end_date: string;
        };
        Insert: Omit<Database['public']['Tables']['featured_novels']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['featured_novels']['Insert']>;
      };
    };
  };
};
