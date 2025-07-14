-- Complete fix for feed functionality
-- This script ensures all necessary policies, tables, and data consistency

-- 1. First, check and fix RLS policies for tasting_notes

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Users can view friends' tasting notes" ON public.tasting_notes;

-- Create the correct policy to allow viewing friends' notes
CREATE POLICY "Users can view friends' tasting notes" 
  ON public.tasting_notes FOR SELECT 
  USING (
    user_id IN (
      SELECT friend_id 
      FROM public.friends 
      WHERE user_id = auth.uid()
    )
  );

-- 2. Ensure profiles table has proper indexes and constraints
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- 3. Create a view for feed notes that properly handles the join
CREATE OR REPLACE VIEW feed_notes_view AS
SELECT 
  tn.*,
  COALESCE(p.username, 'unknown') as username,
  COALESCE(p.display_name, 'Unknown User') as display_name
FROM tasting_notes tn
LEFT JOIN profiles p ON tn.user_id = p.id
WHERE tn.ratings IS NOT NULL
  AND tn.user_id = auth.uid() 
  OR tn.user_id IN (
    SELECT friend_id 
    FROM friends 
    WHERE user_id = auth.uid()
  );

-- Grant access to the view
GRANT SELECT ON feed_notes_view TO authenticated;

-- 4. Create a helper function to get feed notes
CREATE OR REPLACE FUNCTION get_feed_notes(user_limit INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  date TIMESTAMP WITH TIME ZONE,
  country TEXT,
  farm TEXT,
  region TEXT,
  variety TEXT,
  altitude TEXT,
  process TEXT,
  cup_notes TEXT,
  store_info TEXT,
  ratings JSONB,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  extracted_text TEXT,
  username TEXT,
  display_name TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    tn.id,
    tn.user_id,
    tn.title,
    tn.date,
    tn.country,
    tn.farm,
    tn.region,
    tn.variety,
    tn.altitude,
    tn.process,
    tn.cup_notes,
    tn.store_info,
    tn.ratings,
    tn.notes,
    tn.image_url,
    tn.created_at,
    tn.updated_at,
    tn.extracted_text,
    COALESCE(p.username, 'user_' || SUBSTRING(tn.user_id::TEXT, 1, 8)) as username,
    COALESCE(p.display_name, 'Unknown User') as display_name
  FROM tasting_notes tn
  LEFT JOIN profiles p ON tn.user_id = p.id
  WHERE tn.ratings IS NOT NULL
    AND (
      tn.user_id = auth.uid() 
      OR tn.user_id IN (
        SELECT friend_id 
        FROM friends 
        WHERE user_id = auth.uid()
      )
    )
  ORDER BY tn.created_at DESC
  LIMIT user_limit;
$$;

-- 5. Ensure all users have profiles
INSERT INTO profiles (id, display_name)
SELECT 
  u.id,
  COALESCE(u.email, 'User') as display_name
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- 6. Check data consistency
-- Update any tasting_notes with null ratings to default ratings
UPDATE tasting_notes 
SET ratings = '{
  "aroma": 5,
  "flavor": 5,
  "acidity": 5,
  "sweetness": 5,
  "body": 5,
  "aftertaste": 5,
  "balance": 5,
  "overall": 5
}'::jsonb
WHERE ratings IS NULL;

-- 7. Create diagnostic queries for debugging

-- Show current RLS policies
CREATE OR REPLACE FUNCTION show_tasting_notes_policies()
RETURNS TABLE (
  policyname NAME,
  cmd TEXT,
  qual TEXT
)
LANGUAGE SQL
AS $$
  SELECT 
    policyname,
    cmd,
    qual
  FROM pg_policies 
  WHERE tablename = 'tasting_notes'
  ORDER BY policyname;
$$;

-- Show user's feed data for debugging
CREATE OR REPLACE FUNCTION debug_user_feed()
RETURNS TABLE (
  user_id UUID,
  user_notes_count BIGINT,
  friends_count BIGINT,
  friends_notes_count BIGINT,
  total_feed_notes BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH user_notes AS (
    SELECT COUNT(*) as cnt
    FROM tasting_notes 
    WHERE user_id = auth.uid()
      AND ratings IS NOT NULL
  ),
  user_friends AS (
    SELECT COUNT(*) as cnt
    FROM friends 
    WHERE user_id = auth.uid()
  ),
  friends_notes AS (
    SELECT COUNT(*) as cnt
    FROM tasting_notes tn
    WHERE tn.user_id IN (
      SELECT friend_id 
      FROM friends 
      WHERE user_id = auth.uid()
    )
    AND tn.ratings IS NOT NULL
  ),
  total_notes AS (
    SELECT COUNT(*) as cnt
    FROM tasting_notes tn
    WHERE (
      tn.user_id = auth.uid() 
      OR tn.user_id IN (
        SELECT friend_id 
        FROM friends 
        WHERE user_id = auth.uid()
      )
    )
    AND tn.ratings IS NOT NULL
  )
  SELECT 
    auth.uid() as user_id,
    un.cnt as user_notes_count,
    uf.cnt as friends_count,
    fn.cnt as friends_notes_count,
    tn.cnt as total_feed_notes
  FROM user_notes un
  CROSS JOIN user_friends uf
  CROSS JOIN friends_notes fn
  CROSS JOIN total_notes tn;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_feed_notes(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION show_tasting_notes_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION debug_user_feed() TO authenticated;

-- 8. Final verification queries
SELECT 'Setup complete. Run these queries to verify:' as message;
SELECT 'SELECT * FROM show_tasting_notes_policies();' as query1;
SELECT 'SELECT * FROM debug_user_feed();' as query2;
SELECT 'SELECT * FROM get_feed_notes(5);' as query3;