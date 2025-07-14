-- Test script to create sample data for feed testing
-- Run this after applying fix-feed-complete.sql

-- First, let's create some test data if the database is empty

-- 1. Create a test user profile (if needed)
-- Note: This assumes you have at least one authenticated user

-- 2. Create sample tasting notes for testing
-- Replace 'your-user-id-here' with an actual user UUID from auth.users

/*
-- Sample insert for testing (uncomment and update with real user ID):

INSERT INTO tasting_notes (
  user_id, 
  title, 
  country, 
  region, 
  variety, 
  process,
  cup_notes,
  ratings
) VALUES (
  'your-user-id-here',
  'Test Colombian Coffee',
  'Colombia',
  'Huila', 
  'Caturra',
  'Washed',
  'Citrus, chocolate, caramel notes',
  '{
    "aroma": 8,
    "flavor": 7,
    "acidity": 8,
    "sweetness": 6,
    "body": 7,
    "aftertaste": 7,
    "balance": 7,
    "overall": 7
  }'::jsonb
),
(
  'your-user-id-here',
  'Ethiopian Yirgacheffe',
  'Ethiopia',
  'Yirgacheffe',
  'Heirloom',
  'Natural',
  'Floral, berry, wine-like acidity',
  '{
    "aroma": 9,
    "flavor": 8,
    "acidity": 9,
    "sweetness": 7,
    "body": 6,
    "aftertaste": 8,
    "balance": 8,
    "overall": 8
  }'::jsonb
);
*/

-- 3. Diagnostic queries to check current state

-- Check if we have any users
SELECT 
  'Users in database:' as info,
  COUNT(*) as count
FROM auth.users;

-- Check if we have any profiles
SELECT 
  'Profiles in database:' as info,
  COUNT(*) as count
FROM profiles;

-- Check if we have any tasting notes
SELECT 
  'Tasting notes in database:' as info,
  COUNT(*) as count
FROM tasting_notes;

-- Check if we have any friends relationships
SELECT 
  'Friend relationships in database:' as info,
  COUNT(*) as count
FROM friends;

-- Show all users and their profiles
SELECT 
  u.id as user_id,
  u.email,
  p.username,
  p.display_name,
  (SELECT COUNT(*) FROM tasting_notes tn WHERE tn.user_id = u.id) as note_count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Show current RLS policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'tasting_notes'
ORDER BY policyname;

-- Instructions for testing:
SELECT '
TESTING INSTRUCTIONS:
1. Apply fix-feed-complete.sql first
2. Create some test tasting notes (see commented INSERT above)  
3. Optionally create friend relationships for testing
4. Check browser console for detailed debug logs
5. Use the debug functions:
   - SELECT * FROM debug_user_feed();
   - SELECT * FROM get_feed_notes(5);
' as instructions;