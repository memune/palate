-- Friends system tables and policies

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Prevent duplicate requests
    UNIQUE(sender_id, receiver_id),
    -- Prevent self-requests
    CHECK (sender_id != receiver_id)
);

-- Friends table (stores accepted friendships)
CREATE TABLE IF NOT EXISTS friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Prevent duplicate friendships
    UNIQUE(user_id, friend_id),
    -- Prevent self-friendship
    CHECK (user_id != friend_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);

-- Row Level Security policies

-- Friend requests policies
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Users can view requests they sent or received
CREATE POLICY "Users can view their friend requests" ON friend_requests
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

-- Users can send friend requests
CREATE POLICY "Users can send friend requests" ON friend_requests
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

-- Users can update requests they received (accept/reject)
CREATE POLICY "Users can update received requests" ON friend_requests
    FOR UPDATE USING (
        auth.uid() = receiver_id
    ) WITH CHECK (
        auth.uid() = receiver_id
    );

-- Users can delete requests they sent (cancel)
CREATE POLICY "Users can delete sent requests" ON friend_requests
    FOR DELETE USING (
        auth.uid() = sender_id
    );

-- Friends policies
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they're part of
CREATE POLICY "Users can view their friendships" ON friends
    FOR SELECT USING (
        auth.uid() = user_id OR auth.uid() = friend_id
    );

-- System can create friendships (triggered by accepted requests)
CREATE POLICY "System can create friendships" ON friends
    FOR INSERT WITH CHECK (true);

-- Users can delete their friendships
CREATE POLICY "Users can delete their friendships" ON friends
    FOR DELETE USING (
        auth.uid() = user_id OR auth.uid() = friend_id
    );

-- Function to create mutual friendship when request is accepted
CREATE OR REPLACE FUNCTION create_mutual_friendship()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if status changed to 'accepted'
    IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
        -- Create friendship from sender to receiver
        INSERT INTO friends (user_id, friend_id)
        VALUES (NEW.sender_id, NEW.receiver_id)
        ON CONFLICT (user_id, friend_id) DO NOTHING;
        
        -- Create mutual friendship from receiver to sender
        INSERT INTO friends (user_id, friend_id)
        VALUES (NEW.receiver_id, NEW.sender_id)
        ON CONFLICT (user_id, friend_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create friendship when request is accepted
CREATE TRIGGER trigger_create_friendship
    AFTER UPDATE ON friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION create_mutual_friendship();

-- Function to remove mutual friendship when friendship is deleted
CREATE OR REPLACE FUNCTION remove_mutual_friendship()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove the mutual friendship
    DELETE FROM friends 
    WHERE user_id = OLD.friend_id AND friend_id = OLD.user_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically remove mutual friendship
CREATE TRIGGER trigger_remove_mutual_friendship
    AFTER DELETE ON friends
    FOR EACH ROW
    EXECUTE FUNCTION remove_mutual_friendship();

-- Update timestamps trigger for friend_requests
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_friend_requests_updated_at
    BEFORE UPDATE ON friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();