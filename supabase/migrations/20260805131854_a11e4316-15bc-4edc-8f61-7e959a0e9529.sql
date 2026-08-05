CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','admin','instructor')
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = 'instructor'::public.app_user_role
  )
$function$;