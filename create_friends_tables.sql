-- Create friend_requests table
CREATE TABLE friend_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(sender_id, receiver_id),
    CHECK (sender_id != receiver_id)
);

-- Create friends table
CREATE TABLE friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Indexes
CREATE INDEX idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_status ON friend_requests(status);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);

-- Enable RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Friend requests policies
CREATE POLICY "Users can view their friend requests" ON friend_requests
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests" ON friend_requests
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received requests" ON friend_requests
    FOR UPDATE USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete sent requests" ON friend_requests
    FOR DELETE USING (auth.uid() = sender_id);

-- Friends policies
CREATE POLICY "Users can view their friendships" ON friends
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "System can create friendships" ON friends
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their friendships" ON friends
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Function to create mutual friendship when request is accepted
CREATE OR REPLACE FUNCTION create_mutual_friendship()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
        INSERT INTO friends (user_id, friend_id)
        VALUES (NEW.sender_id, NEW.receiver_id)
        ON CONFLICT (user_id, friend_id) DO NOTHING;
        
        INSERT INTO friends (user_id, friend_id)
        VALUES (NEW.receiver_id, NEW.sender_id)
        ON CONFLICT (user_id, friend_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic friendship creation
CREATE TRIGGER trigger_create_friendship
    AFTER UPDATE ON friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION create_mutual_friendship();

-- Function to remove mutual friendship
CREATE OR REPLACE FUNCTION remove_mutual_friendship()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM friends 
    WHERE user_id = OLD.friend_id AND friend_id = OLD.user_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for mutual friendship removal
CREATE TRIGGER trigger_remove_mutual_friendship
    AFTER DELETE ON friends
    FOR EACH ROW
    EXECUTE FUNCTION remove_mutual_friendship();