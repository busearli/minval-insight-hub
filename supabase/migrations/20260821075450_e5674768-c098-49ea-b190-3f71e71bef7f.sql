-- Move coordination membership check into private schema (definer), expose invoker wrapper
CREATE OR REPLACE FUNCTION private.in_coordination(_user_id uuid, _coordination_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coordination_members m
    WHERE m.user_id = _user_id AND m.coordination_id = _coordination_id
  )
$$;

REVOKE ALL ON FUNCTION private.in_coordination(uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.in_coordination(_user_id uuid, _coordination_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'private', 'pg_temp'
AS $$ SELECT private.in_coordination(_user_id, _coordination_id) $$;

GRANT EXECUTE ON FUNCTION public.in_coordination(uuid, uuid) TO authenticated, service_role;

-- Limit anonymous visitors to non-sensitive class columns only
REVOKE SELECT ON public.classes FROM anon;
GRANT SELECT (id, program, name, level, schedule) ON public.classes TO anon;
