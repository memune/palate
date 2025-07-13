-- Fix foreign key references in friends system to properly reference profiles table

-- Drop existing foreign key constraints if they exist
ALTER TABLE friend_requests 
DROP CONSTRAINT IF EXISTS friend_requests_sender_id_fkey,
DROP CONSTRAINT IF EXISTS friend_requests_receiver_id_fkey;

ALTER TABLE friends 
DROP CONSTRAINT IF EXISTS friends_user_id_fkey,
DROP CONSTRAINT IF EXISTS friends_friend_id_fkey;

-- Add proper foreign key constraints referencing profiles table
ALTER TABLE friend_requests 
ADD CONSTRAINT friend_requests_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT friend_requests_receiver_id_fkey 
    FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE friends 
ADD CONSTRAINT friends_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT friends_friend_id_fkey 
    FOREIGN KEY (friend_id) REFERENCES profiles(id) ON DELETE CASCADE;