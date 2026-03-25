-- ============================================
-- ECS GAME - Social Layer (DMs, Presence, Friends)
-- ============================================

-- Direct messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Online presence
CREATE TABLE presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'online',
  current_page TEXT,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Friend connections
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_receiver ON friendships(receiver_id);

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages" ON messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can send messages" ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can mark messages read" ON messages FOR UPDATE
  USING (receiver_id = auth.uid());

CREATE POLICY "Anyone can view presence" ON presence FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their presence" ON presence FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own presence" ON presence FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their friendships" ON friendships FOR SELECT
  USING (requester_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can send friend requests" ON friendships FOR INSERT
  WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Users can respond to friend requests" ON friendships FOR UPDATE
  USING (receiver_id = auth.uid());
