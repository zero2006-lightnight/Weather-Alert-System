-- ADMIN RPC FUNCTIONS WITH AUTHORIZATION CHECKS
-- Paste this entire file into Supabase SQL Editor and run it.

-- Admin: Get all farmers (bypasses RLS, requires admin role)
CREATE OR REPLACE FUNCTION public.admin_get_farmers(p_search TEXT DEFAULT NULL, p_limit INTEGER DEFAULT 50)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Authorization check: only admins can call this
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

-- Admin: Get stats (bypasses RLS, requires admin role)
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
  -- Authorization check
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

-- Admin: Delete user and all related data (bypasses RLS, requires admin role)
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Authorization check
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  DELETE FROM public.weather_history WHERE user_id = p_user_id;
  DELETE FROM public.notifications WHERE user_id = p_user_id;
  DELETE FROM public.crop_recommendations WHERE user_id = p_user_id;
  DELETE FROM public.alerts WHERE user_id = p_user_id;
  DELETE FROM public.favorite_locations WHERE user_id = p_user_id;
  DELETE FROM public.profiles WHERE id = p_user_id;
  RETURN true;
END;
$$;

-- Admin: Broadcast alert to all farmers (bypasses RLS, requires admin role)
CREATE OR REPLACE FUNCTION public.admin_broadcast_alert(
  p_type TEXT, p_severity TEXT, p_title TEXT, p_message TEXT, p_recommendation TEXT DEFAULT ''
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  farmer RECORD;
  alert_count INTEGER := 0;
BEGIN
  -- Authorization check
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  FOR farmer IN SELECT id FROM public.profiles WHERE role != 'admin' AND is_active = true
  LOOP
    INSERT INTO public.alerts (user_id, type, severity, title, message, recommendation, is_broadcast)
    VALUES (farmer.id, p_type, p_severity, p_title, p_message, p_recommendation, true);
    alert_count := alert_count + 1;
  END LOOP;
  RETURN alert_count;
END;
$$;
