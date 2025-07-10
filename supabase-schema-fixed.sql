-- Create tasting_notes table
CREATE TABLE IF NOT EXISTS public.tasting_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  extracted_text TEXT,
  
  -- Coffee Information
  country TEXT,
  farm TEXT,
  region TEXT,
  variety TEXT,
  altitude TEXT,
  process TEXT,
  cup_notes TEXT,
  store_info TEXT,
  
  -- Ratings (stored as JSONB for flexibility)
  ratings JSONB NOT NULL DEFAULT '{
    "aroma": 5,
    "flavor": 5,
    "acidity": 5,
    "sweetness": 5,
    "body": 5,
    "aftertaste": 5,
    "balance": 5,
    "overall": 5
  }'::jsonb,
  
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.tasting_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tasting notes" 
  ON public.tasting_notes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasting notes" 
  ON public.tasting_notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasting notes" 
  ON public.tasting_notes FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasting notes" 
  ON public.tasting_notes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasting_notes_user_id_idx ON public.tasting_notes(user_id);
CREATE INDEX IF NOT EXISTS tasting_notes_created_at_idx ON public.tasting_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS tasting_notes_country_idx ON public.tasting_notes(country);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasting_notes_updated_at 
  BEFORE UPDATE ON public.tasting_notes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();