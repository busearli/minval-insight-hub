
CREATE TABLE public.coordinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coordinations TO authenticated;
GRANT SELECT ON public.coordinations TO anon;
GRANT ALL ON public.coordinations TO service_role;
ALTER TABLE public.coordinations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.coordination_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coordination_id uuid NOT NULL REFERENCES public.coordinations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Üye',
  is_lead boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coordination_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coordination_members TO authenticated;
GRANT ALL ON public.coordination_members TO service_role;
ALTER TABLE public.coordination_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.coordination_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coordination_id uuid NOT NULL REFERENCES public.coordinations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  owner_name text NOT NULL DEFAULT '',
  owner_user_id uuid,
  status text NOT NULL DEFAULT 'baslanmadi',
  progress integer NOT NULL DEFAULT 0,
  due_date date,
  notes text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coordination_goals TO authenticated;
GRANT ALL ON public.coordination_goals TO service_role;
ALTER TABLE public.coordination_goals ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.in_coordination(_user_id uuid, _coordination_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coordination_members m
    WHERE m.user_id = _user_id AND m.coordination_id = _coordination_id
  )
$$;
GRANT EXECUTE ON FUNCTION public.in_coordination(uuid, uuid) TO authenticated;

CREATE POLICY "coordinations_read" ON public.coordinations FOR SELECT TO authenticated USING (true);
CREATE POLICY "coordinations_manage" ON public.coordinations FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "coord_members_read" ON public.coordination_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "coord_members_manage" ON public.coordination_members FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "coord_goals_read" ON public.coordination_goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "coord_goals_manage" ON public.coordination_goals FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.in_coordination(auth.uid(), coordination_id))
  WITH CHECK (public.is_admin(auth.uid()) OR public.in_coordination(auth.uid(), coordination_id));

CREATE TRIGGER coordinations_updated_at BEFORE UPDATE ON public.coordinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER coordination_goals_updated_at BEFORE UPDATE ON public.coordination_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS signup_event_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS signup_event_label text NOT NULL DEFAULT 'Katılmak istediğiniz etkinlik',
  ADD COLUMN IF NOT EXISTS signup_event_options_json jsonb NOT NULL DEFAULT '[]'::jsonb;
