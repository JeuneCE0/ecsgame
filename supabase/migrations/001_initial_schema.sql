-- ============================================
-- ECS GAME - Initial Database Schema
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('player', 'admin', 'super_admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'team', 'enterprise');
CREATE TYPE quest_type AS ENUM ('daily', 'weekly', 'main', 'special');
CREATE TYPE quest_status AS ENUM ('available', 'in_progress', 'completed', 'expired');
CREATE TYPE xp_source AS ENUM (
  'quest_completion',
  'call_booked',
  'deal_closed',
  'lead_generated',
  'formation_completed',
  'streak_bonus',
  'manual_log',
  'referral',
  'badge_earned',
  'admin_grant'
);
CREATE TYPE verification_status AS ENUM ('auto_verified', 'pending_review', 'approved', 'rejected');
CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- ============================================
-- TABLES
-- ============================================

-- Organizations (multi-tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  stripe_customer_id TEXT,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  max_members INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'player',
  level INT NOT NULL DEFAULT 1,
  total_xp BIGINT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- XP Events (every XP gain is logged)
CREATE TABLE xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  source xp_source NOT NULL,
  amount INT NOT NULL CHECK (amount > 0),
  description TEXT,
  proof_url TEXT,
  verification_status verification_status NOT NULL DEFAULT 'auto_verified',
  reviewed_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Level thresholds
CREATE TABLE level_thresholds (
  level INT PRIMARY KEY,
  xp_required BIGINT NOT NULL,
  title TEXT NOT NULL,
  perks JSONB DEFAULT '[]'
);

-- Quests
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quest_type quest_type NOT NULL,
  xp_reward INT NOT NULL CHECK (xp_reward > 0),
  required_count INT NOT NULL DEFAULT 1,
  source_filter xp_source,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User quest progress
CREATE TABLE user_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  progress INT NOT NULL DEFAULT 0,
  status quest_status NOT NULL DEFAULT 'available',
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  rarity badge_rarity NOT NULL DEFAULT 'common',
  condition_type TEXT NOT NULL,
  condition_value JSONB NOT NULL,
  xp_bonus INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Formations (learning content)
CREATE TABLE formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_url TEXT,
  thumbnail_url TEXT,
  xp_reward INT NOT NULL DEFAULT 50,
  duration_minutes INT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User formation progress
CREATE TABLE user_formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  formation_id UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, formation_id)
);

-- Rewards shop
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  cost_xp INT NOT NULL CHECK (cost_xp > 0),
  stock INT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reward claims
CREATE TABLE reward_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Work timer sessions
CREATE TABLE timer_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_profiles_level ON profiles(level DESC);
CREATE INDEX idx_profiles_total_xp ON profiles(total_xp DESC);
CREATE INDEX idx_xp_events_user ON xp_events(user_id);
CREATE INDEX idx_xp_events_org ON xp_events(organization_id);
CREATE INDEX idx_xp_events_created ON xp_events(created_at DESC);
CREATE INDEX idx_xp_events_source ON xp_events(source);
CREATE INDEX idx_user_quests_user ON user_quests(user_id);
CREATE INDEX idx_user_quests_status ON user_quests(status);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_timer_sessions_user ON timer_sessions(user_id);

-- ============================================
-- MATERIALIZED VIEW: Leaderboard
-- ============================================

CREATE MATERIALIZED VIEW leaderboard_view AS
SELECT
  p.id AS user_id,
  p.full_name,
  p.avatar_url,
  p.level,
  p.total_xp,
  p.current_streak,
  p.organization_id,
  o.name AS organization_name,
  COALESCE(weekly.weekly_xp, 0) AS weekly_xp,
  ROW_NUMBER() OVER (ORDER BY p.total_xp DESC) AS global_rank,
  ROW_NUMBER() OVER (PARTITION BY p.organization_id ORDER BY p.total_xp DESC) AS org_rank
FROM profiles p
LEFT JOIN organizations o ON o.id = p.organization_id
LEFT JOIN LATERAL (
  SELECT SUM(amount) AS weekly_xp
  FROM xp_events xe
  WHERE xe.user_id = p.id
    AND xe.created_at >= DATE_TRUNC('week', NOW())
    AND xe.verification_status IN ('auto_verified', 'approved')
) weekly ON TRUE
WHERE p.total_xp > 0;

CREATE UNIQUE INDEX idx_leaderboard_user ON leaderboard_view(user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_quests_updated_at BEFORE UPDATE ON quests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_user_quests_updated_at BEFORE UPDATE ON user_quests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_formations_updated_at BEFORE UPDATE ON formations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_user_formations_updated_at BEFORE UPDATE ON user_formations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rewards_updated_at BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Recalculate total_xp after XP event
CREATE OR REPLACE FUNCTION recalculate_total_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET total_xp = (
    SELECT COALESCE(SUM(amount), 0)
    FROM xp_events
    WHERE user_id = NEW.user_id
      AND verification_status IN ('auto_verified', 'approved')
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_recalculate_xp AFTER INSERT OR UPDATE ON xp_events
  FOR EACH ROW EXECUTE FUNCTION recalculate_total_xp();

-- Check level-up after XP change
CREATE OR REPLACE FUNCTION check_level_up()
RETURNS TRIGGER AS $$
DECLARE
  new_level INT;
BEGIN
  SELECT MAX(level) INTO new_level
  FROM level_thresholds
  WHERE xp_required <= NEW.total_xp;

  IF new_level IS NOT NULL AND new_level > OLD.level THEN
    NEW.level = new_level;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_level_up BEFORE UPDATE OF total_xp ON profiles
  FOR EACH ROW EXECUTE FUNCTION check_level_up();

-- Update streak
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  today DATE := CURRENT_DATE;
BEGIN
  SELECT last_active_date INTO last_date
  FROM profiles
  WHERE id = NEW.user_id;

  IF last_date IS NULL OR last_date < today - INTERVAL '1 day' THEN
    UPDATE profiles
    SET current_streak = 1,
        last_active_date = today,
        longest_streak = GREATEST(longest_streak, 1)
    WHERE id = NEW.user_id;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    UPDATE profiles
    SET current_streak = current_streak + 1,
        last_active_date = today,
        longest_streak = GREATEST(longest_streak, current_streak + 1)
    WHERE id = NEW.user_id;
  ELSIF last_date = today THEN
    -- Already active today, no streak change
    NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_streak AFTER INSERT ON xp_events
  FOR EACH ROW EXECUTE FUNCTION update_streak();

-- Create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Refresh leaderboard (called by pg_cron)
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_view;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_thresholds ENABLE ROW LEVEL SECURITY;

-- Organizations: members can read their own org
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Profiles: users can read org members, update themselves
CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR id = auth.uid()
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- XP Events: users see their own + org events
CREATE POLICY "Users can view their own xp events"
  ON xp_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view org xp events"
  ON xp_events FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert their own xp events"
  ON xp_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Quests: visible if global or same org
CREATE POLICY "Users can view available quests"
  ON quests FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- User quests: own data only
CREATE POLICY "Users can view their own quest progress"
  ON user_quests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own quest progress"
  ON user_quests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quest progress"
  ON user_quests FOR UPDATE
  USING (user_id = auth.uid());

-- Badges: all authenticated users can read
CREATE POLICY "Authenticated users can view badges"
  ON badges FOR SELECT
  USING (auth.role() = 'authenticated');

-- User badges: own data
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (user_id = auth.uid());

-- Formations: org-scoped
CREATE POLICY "Users can view formations"
  ON formations FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- User formations: own data
CREATE POLICY "Users can view their own formation progress"
  ON user_formations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own formation progress"
  ON user_formations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own formation progress"
  ON user_formations FOR UPDATE
  USING (user_id = auth.uid());

-- Rewards: org-scoped read
CREATE POLICY "Users can view rewards"
  ON rewards FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Reward claims: own data
CREATE POLICY "Users can view their own claims"
  ON reward_claims FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can claim rewards"
  ON reward_claims FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Timer sessions: own data
CREATE POLICY "Users can view their own timer sessions"
  ON timer_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create timer sessions"
  ON timer_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own timer sessions"
  ON timer_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Level thresholds: all authenticated can read
CREATE POLICY "Authenticated users can view level thresholds"
  ON level_thresholds FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- ADMIN POLICIES
-- ============================================

CREATE POLICY "Admins can manage quests"
  ON quests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage formations"
  ON formations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage rewards"
  ON rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view all profiles in org"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can review xp events"
  ON xp_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- SEED: Level Thresholds
-- ============================================

INSERT INTO level_thresholds (level, xp_required, title, perks) VALUES
  (1,  0,       'Recrue',           '[]'),
  (2,  100,     'Apprenti',         '["Accès quêtes weekly"]'),
  (3,  300,     'Vendeur',          '["Badge vendeur"]'),
  (4,  600,     'Closer',           '["Accès formations avancées"]'),
  (5,  1000,    'Négociateur',      '["Badge négociateur"]'),
  (6,  1500,    'Business Dev',     '["Accès leaderboard VIP"]'),
  (7,  2200,    'Rainmaker',        '["Badge rainmaker"]'),
  (8,  3000,    'Directeur',        '["Récompenses exclusives"]'),
  (9,  4000,    'VP Sales',         '["Badge VP"]'),
  (10, 5500,    'Partenaire',       '["Accès beta features"]'),
  (11, 7500,    'Associé',          '["Badge associé"]'),
  (12, 10000,   'CEO',              '["Accès total"]'),
  (13, 13000,   'Mogul',            '["Badge mogul"]'),
  (14, 17000,   'Titan',            '["Badge titan"]'),
  (15, 22000,   'Légende',          '["Badge légendaire", "Titre spécial"]')
ON CONFLICT (level) DO NOTHING;

-- ============================================
-- SEED: Default Organization (Scale Corp)
-- ============================================

INSERT INTO organizations (id, name, slug, subscription_tier, max_members)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Scale Corp',
  'scale-corp',
  'enterprise',
  100
) ON CONFLICT DO NOTHING;

-- ============================================
-- SEED: Default Badges
-- ============================================

INSERT INTO badges (name, description, icon_url, rarity, condition_type, condition_value, xp_bonus) VALUES
  ('Premier Pas',     'Log ta première action XP',              NULL, 'common',    'xp_events_count',  '{"min": 1}',     25),
  ('Série de 3',      'Maintiens un streak de 3 jours',         NULL, 'common',    'streak',           '{"min": 3}',     50),
  ('Série de 7',      'Maintiens un streak de 7 jours',         NULL, 'rare',      'streak',           '{"min": 7}',     100),
  ('Série de 30',     'Maintiens un streak de 30 jours',        NULL, 'epic',      'streak',           '{"min": 30}',    500),
  ('First Close',     'Close ton premier deal',                 NULL, 'common',    'source_count',     '{"source": "deal_closed", "min": 1}',   50),
  ('Closer Pro',      'Close 10 deals',                         NULL, 'rare',      'source_count',     '{"source": "deal_closed", "min": 10}',  200),
  ('Machine à Leads', 'Génère 50 leads',                        NULL, 'rare',      'source_count',     '{"source": "lead_generated", "min": 50}', 200),
  ('XP Hunter',       'Accumule 5000 XP',                       NULL, 'epic',      'total_xp',         '{"min": 5000}',  300),
  ('Légende Vivante', 'Atteins le niveau 15',                   NULL, 'legendary', 'level',            '{"min": 15}',    1000),
  ('Apporteur d''Or', 'Réfère 10 membres',                      NULL, 'epic',      'source_count',     '{"source": "referral", "min": 10}', 500)
ON CONFLICT DO NOTHING;

-- ============================================
-- CRON: Refresh leaderboard every 5 minutes
-- ============================================

SELECT cron.schedule(
  'refresh-leaderboard',
  '*/5 * * * *',
  'SELECT refresh_leaderboard()'
);

-- CRON: Reset daily quests at midnight UTC
SELECT cron.schedule(
  'reset-daily-quests',
  '0 0 * * *',
  $$
  UPDATE user_quests uq
  SET status = 'available', progress = 0, completed_at = NULL, claimed_at = NULL
  FROM quests q
  WHERE uq.quest_id = q.id
    AND q.quest_type = 'daily'
    AND uq.status != 'available';
  $$
);
