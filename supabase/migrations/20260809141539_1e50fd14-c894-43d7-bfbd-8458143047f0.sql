
REVOKE ALL ON FUNCTION public.in_coordination(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.in_coordination(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.in_coordination(uuid, uuid) TO authenticated;
