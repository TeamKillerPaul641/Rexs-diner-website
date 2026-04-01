-- ============================================
-- CONSOLIDATED MIGRATION: All tables & data
-- ============================================

-- 001: Create base tables
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  user_group TEXT DEFAULT 'mitarbeiter',
  must_change_password BOOLEAN DEFAULT true,
  is_temporary_password BOOLEAN DEFAULT false,
  discord_user_id TEXT,
  image TEXT,
  warning_count INTEGER DEFAULT 0,
  suspended_until TIMESTAMP WITH TIME ZONE,
  dienstvorschriften_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ensure new columns exist on existing databases
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE;


CREATE TABLE IF NOT EXISTS public.ranks (
  id SERIAL PRIMARY KEY,
  rank_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 30,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.website_config (
  id SERIAL PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reservations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guests INTEGER NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'Ausstehend',
  notes TEXT,
  timestamp BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Neu',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  category TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_ratings (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER REFERENCES public.menu_items(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.discount_codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hausverbote (
  id BIGSERIAL PRIMARY KEY,
  who TEXT NOT NULL,
  reason TEXT NOT NULL,
  duration TEXT,
  photo TEXT,
  timestamp BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

CREATE TABLE IF NOT EXISTS public.werkstatt_orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'Neu',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  discount_code TEXT,
  discount_percent INTEGER DEFAULT 0
);

CREATE TABLE public.calendar_events (
  id integer NOT NULL DEFAULT nextval('calendar_events_id_seq'::regclass),
  date text NOT NULL,
  title text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  location text,
  CONSTRAINT calendar_events_pkey PRIMARY KEY (id)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_hausverbote_timestamp ON public.hausverbote (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_hausverbote_who ON public.hausverbote (who);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events (date);


-- ============================================
-- RLS policies
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hausverbote ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.werkstatt_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to users" ON public.users;
DROP POLICY IF EXISTS "Allow all access to ranks" ON public.ranks;
DROP POLICY IF EXISTS "Allow all access to website_config" ON public.website_config;
DROP POLICY IF EXISTS "Allow all access to reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow all access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow all access to menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow all access to menu_ratings" ON public.menu_ratings;
DROP POLICY IF EXISTS "Allow all access to discount_codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Allow all access to hausverbote" ON public.hausverbote;
DROP POLICY IF EXISTS "Allow all access to werkstatt_orders" ON public.werkstatt_orders;
DROP POLICY IF EXISTS "Allow all access to calendar_events" ON public.calendar_events;


CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to ranks" ON public.ranks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to website_config" ON public.website_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to reservations" ON public.reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to menu_ratings" ON public.menu_ratings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to discount_codes" ON public.discount_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to hausverbote" ON public.hausverbote FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to werkstatt_orders" ON public.werkstatt_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to calendar_events" ON public.calendar_events FOR ALL USING (true) WITH CHECK (true);


-- ============================================
-- Seed data
-- ============================================

-- Default admin user
INSERT INTO public.users (username, password, role, user_group, must_change_password, is_temporary_password)
VALUES ('Website Entwickler (TeamKillerpaul)', '$2b$12$...', 'admin', 'owner', false, false)
ON CONFLICT (username) DO NOTHING;

-- Default website config
INSERT INTO "public"."website_config" ("id", "config_key", "config_value", "created_at", "updated_at") VALUES ('1', 'discord_channels', '{"orders":"1476083546912194703","reviews":"1476083546912194703","adminLogs":"1476083546912194703","reservations":"1476083546912194703","announcements":"1476083546912194703"}', '2026-01-29 21:09:24.290699+00', '2026-02-25 21:35:55.454+00'), ('2', 'opening_hours', '{"So":"12:00 - 22:00","Fr-Sa":"17:00 - 24:00","Mo-Do":"17:00 - 23:00"}', '2026-01-29 21:09:24.290699+00', '2026-02-25 21:35:55.597+00'), ('3', 'website_settings', '{"title":"Rex''s Diner","contactCity":"3056 Teamhausen","description":"Authentisches Restaurant","contactPhone":"+49 (0) 123 456789","contactAddress":"Senora Way","contactDiscord":"https://discord.gg/v42GuchGEr"}', '2026-01-29 21:09:24.290699+00', '2026-02-25 21:35:55.734+00'), ('4', 'discord_bot', '{"token":"MTM5NzM0Njc3MzY4ODY0NzY4MA.GxLgpu.hs-ijYoU0ixDxrYnktx5xarKpkiZa8K5hKLMik","guildId":"1293655038501064917","clientId":"1397346773688647680"}', '2026-01-29 21:09:24.290699+00', '2026-02-25 21:35:55.878+00');
;
