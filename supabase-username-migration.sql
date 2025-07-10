-- Add username fields to users table (through Supabase auth.users metadata)
-- Since we're using Supabase Auth, we'll store username in user_metadata

-- Create a profiles table to store additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(30) UNIQUE,
  display_name VARCHAR(50),
  username_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username_changes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create index for username searches
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- Create function to handle username constraints
CREATE OR REPLACE FUNCTION check_username_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if username is being changed
  IF OLD.username IS DISTINCT FROM NEW.username THEN
    -- Check if 30 days have passed since last change
    IF OLD.username_updated_at > NOW() - INTERVAL '30 days' THEN
      RAISE EXCEPTION 'Username can only be changed once every 30 days';
    END IF;
    
    -- Increment change count
    NEW.username_changes_count = OLD.username_changes_count + 1;
    NEW.username_updated_at = NOW();
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for username change validation
CREATE TRIGGER username_change_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_username_change();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();