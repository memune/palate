import { createClient } from '@supabase/supabase-js';

// For development, use placeholder values if env vars aren't set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jwkhkfgfbdkdflnvtvkl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2hrZmdmYmRrZGZsbnZ0dmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDcxNzQwMDAsImV4cCI6MTk2MjgzNzYwMH0.UO5kqFHWqRVPQJdGe_f0aQGzjH1NZuXHKJOJOjlBkDE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      tasting_notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          extracted_text: string | null;
          
          // Coffee Information
          country: string | null;
          farm: string | null;
          region: string | null;
          variety: string | null;
          altitude: string | null;
          process: string | null;
          cup_notes: string | null;
          store_info: string | null;
          
          // Ratings (stored as JSON)
          ratings: {
            aroma: number;
            flavor: number;
            acidity: number;
            sweetness: number;
            body: number;
            aftertaste: number;
            balance: number;
            overall: number;
          };
          
          notes: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          date?: string;
          extracted_text?: string | null;
          country?: string | null;
          farm?: string | null;
          region?: string | null;
          variety?: string | null;
          altitude?: string | null;
          process?: string | null;
          cup_notes?: string | null;
          store_info?: string | null;
          ratings: {
            aroma: number;
            flavor: number;
            acidity: number;
            sweetness: number;
            body: number;
            aftertaste: number;
            balance: number;
            overall: number;
          };
          notes?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          date?: string;
          extracted_text?: string | null;
          country?: string | null;
          farm?: string | null;
          region?: string | null;
          variety?: string | null;
          altitude?: string | null;
          process?: string | null;
          cup_notes?: string | null;
          store_info?: string | null;
          ratings?: {
            aroma: number;
            flavor: number;
            acidity: number;
            sweetness: number;
            body: number;
            aftertaste: number;
            balance: number;
            overall: number;
          };
          notes?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}