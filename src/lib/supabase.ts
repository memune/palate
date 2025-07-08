import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables');
}

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