-- =============================================================================
--  ADMIN RPC FUNCTIONS – SECURITY DEFINER (bypasses RLS)
--  Each function authorizes the caller as admin before proceeding.
-- =============================================================================

-- ─── AUDIT LOG TABLE ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_id   UUID,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can read audit logs (checked at application level; RPC only)
CREATE POLICY "audit_log_admin_only" ON public.audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin: Get all farmers with optional search
CREATE OR REPLACE FUNCTION public.admin_get_farmers(p_search TEXT DEFAULT NULL, p_limit INTEGER DEFAULT 50)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  RETURN QUERY
  SELECT p.* FROM public.profiles p
  WHERE p.role != 'admin'
  AND (
    p_search IS NULL
    OR p.name ILIKE '%' || p_search || '%'
    OR p.email ILIKE '%' || p_search || '%'
    OR p.village ILIKE '%' || p_search || '%'
    OR p.district ILIKE '%' || p_search || '%'
  )
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Admin: Get dashboard stats
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  total_users INTEGER;
  active_today INTEGER;
  total_alerts INTEGER;
  unread_alerts INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  SELECT count(*) INTO total_users FROM public.profiles WHERE role != 'admin';
  SELECT count(*) INTO active_today FROM public.profiles WHERE role != 'admin' AND updated_at >= (now() AT TIME ZONE 'UTC')::date;
  SELECT count(*) INTO total_alerts FROM public.alerts;
  SELECT count(*) INTO unread_alerts FROM public.alerts WHERE is_read = false;

  RETURN json_build_object(
    'totalUsers', total_users,
    'activeToday', active_today,
    'totalAlerts', total_alerts,
    'unreadAlerts', unread_alerts
  );
END;
$$;

-- Admin: Delete user and all related data (with audit log)
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_target_email TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  -- Capture target info before deletion
  SELECT email INTO v_target_email FROM public.profiles WHERE id = p_user_id;

  DELETE FROM public.weather_history WHERE user_id = p_user_id;
  DELETE FROM public.notifications WHERE user_id = p_user_id;
  DELETE FROM public.crop_recommendations WHERE user_id = p_user_id;
  DELETE FROM public.alerts WHERE user_id = p_user_id;
  DELETE FROM public.favorite_locations WHERE user_id = p_user_id;
  DELETE FROM public.profiles WHERE id = p_user_id;

  -- Audit log
  INSERT INTO public.audit_log (admin_id, action, target_id, details)
  VALUES (auth.uid(), 'delete_user', p_user_id,
    json_build_object('email', v_target_email, 'deleted_at', now()));

  RETURN true;
END;
$$;

-- Admin: Broadcast alert to all farmers (set-based, no loop)
CREATE OR REPLACE FUNCTION public.admin_broadcast_alert(
  p_type TEXT, p_severity TEXT, p_title TEXT, p_message TEXT, p_recommendation TEXT DEFAULT ''
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  INSERT INTO public.alerts (user_id, type, severity, title, message, recommendation, is_broadcast)
  SELECT id, p_type, p_severity, p_title, p_message, p_recommendation, true
  FROM public.profiles
  WHERE role != 'admin' AND is_active = true;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
