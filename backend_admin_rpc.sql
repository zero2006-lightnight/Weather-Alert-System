-- FIX: Create admin RPC functions that bypass RLS
-- SECURITY DEFINER means these run with the function owner's privileges, bypassing RLS

-- Admin: Get all farmers (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_get_farmers(p_search TEXT DEFAULT NULL, p_limit INTEGER DEFAULT 50)
RETURNS SETOF public.profiles
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM public.profiles
  WHERE role != 'admin'
  AND (
    p_search IS NULL
    OR name ILIKE '%' || p_search || '%'
    OR email ILIKE '%' || p_search || '%'
    OR village ILIKE '%' || p_search || '%'
    OR district ILIKE '%' || p_search || '%'
  )
  ORDER BY created_at DESC
  LIMIT p_limit;
$$;

-- Admin: Get stats (bypasses RLS)
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

-- Admin: Delete user and all related data (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.weather_history WHERE user_id = p_user_id;
  DELETE FROM public.notifications WHERE user_id = p_user_id;
  DELETE FROM public.crop_recommendations WHERE user_id = p_user_id;
  DELETE FROM public.alerts WHERE user_id = p_user_id;
  DELETE FROM public.favorite_locations WHERE user_id = p_user_id;
  DELETE FROM public.profiles WHERE id = p_user_id;
  RETURN true;
END;
$$;

-- Admin: Broadcast alert to all farmers (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_broadcast_alert(
  p_type TEXT, p_severity TEXT, p_title TEXT, p_message TEXT, p_recommendation TEXT DEFAULT ''
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  farmer RECORD;
  count INTEGER := 0;
BEGIN
  FOR farmer IN SELECT id FROM public.profiles WHERE role != 'admin' AND is_active = true
  LOOP
    INSERT INTO public.alerts (user_id, type, severity, title, message, recommendation, is_broadcast)
    VALUES (farmer.id, p_type, p_severity, p_title, p_message, p_recommendation, true);
    count := count + 1;
  END LOOP;
  RETURN count;
END;
$$;
