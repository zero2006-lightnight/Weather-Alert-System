-- =============================================================================
--  WEATHER ALERT SYSTEM FOR FARMERS – Supabase Schema
--  Paste this entire file into Supabase SQL Editor and run it once.
-- =============================================================================

-- ─── 1. PROFILES TABLE (extends auth.users) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  name          TEXT NOT NULL,
  phone         TEXT,
  village       TEXT,
  district      TEXT,
  state         TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  farm_size     DOUBLE PRECISION,
  crop_type     TEXT,
  role          TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
  preferences   JSONB NOT NULL DEFAULT '{"darkMode":false,"emailNotifications":true,"smsNotifications":false,"browserNotifications":true,"language":"en"}'::jsonb,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. FAVORITE LOCATIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.favorite_locations (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  latitude  DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. WEATHER HISTORY ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.weather_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location    TEXT,
  temperature DOUBLE PRECISION,
  feels_like  DOUBLE PRECISION,
  humidity    INTEGER,
  pressure    INTEGER,
  visibility  INTEGER,
  wind_speed  DOUBLE PRECISION,
  wind_deg    INTEGER,
  clouds      INTEGER,
  uvi         DOUBLE PRECISION,
  description TEXT,
  icon        TEXT,
  raw_data    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 4. ALERTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN (
                    'heavy_rain','storm','cyclone','lightning','heat_wave',
                    'cold_wave','high_humidity','low_temperature','strong_winds',
                    'fog','drought','frost'
                  )),
  severity        TEXT NOT NULL CHECK (severity IN ('info','warning','danger')),
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  recommendation  TEXT,
  location_name   TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  weather_data    JSONB,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  is_broadcast    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. NOTIFICATIONS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('weather_alert','crop_advice','system','broadcast')),
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  channel       TEXT NOT NULL DEFAULT 'browser' CHECK (channel IN ('email','sms','browser','telegram')),
  is_read       BOOLEAN NOT NULL DEFAULT false,
  related_alert_id UUID REFERENCES public.alerts(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 6. CROP RECOMMENDATIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crop_recommendations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weather_condition TEXT,
  title             TEXT NOT NULL,
  description       TEXT,
  advice            JSONB,
  risk_factors      JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 7. AUDIT LOG ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_id   UUID,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
--  INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_weather_history_user_time ON public.weather_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_user_time     ON public.alerts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_user_unread   ON public.alerts (user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fav_locations_user   ON public.favorite_locations (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_time ON public.audit_log (admin_id, created_at DESC);

-- =============================================================================
--  ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_locations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log            ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "profiles_self" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin policies removed to avoid infinite recursion.
-- Admin access is handled at the application level after verifying the user's own profile.

-- Favorite locations: users manage their own
CREATE POLICY "fav_locations_self" ON public.favorite_locations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Weather history: users see their own, admins see all
CREATE POLICY "weather_history_self" ON public.weather_history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin access for weather_history handled at application level

-- Alerts: users see their own, admins see all
CREATE POLICY "alerts_self" ON public.alerts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin access for alerts handled at application level

-- Notifications: users manage their own
CREATE POLICY "notifications_self" ON public.notifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Crop recommendations: users see their own
CREATE POLICY "crop_recommendations_self" ON public.crop_recommendations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin access for crop_recommendations handled at application level

-- =============================================================================
--  TRIGGER: auto-create profile on signup
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
--  TRIGGER: auto-update updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated ON public.profiles;
CREATE TRIGGER profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
