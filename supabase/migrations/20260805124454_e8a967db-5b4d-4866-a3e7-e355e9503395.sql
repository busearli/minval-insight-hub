CREATE TABLE public.hatims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Hatim',
  description text NOT NULL DEFAULT '',
  is_open boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hatims TO authenticated;
GRANT ALL ON public.hatims TO service_role;
ALTER TABLE public.hatims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hatims_select_authenticated" ON public.hatims FOR SELECT TO authenticated USING (true);
CREATE POLICY "hatims_staff_insert" ON public.hatims FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "hatims_staff_update" ON public.hatims FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "hatims_admin_delete" ON public.hatims FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER hatims_updated_at BEFORE UPDATE ON public.hatims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.hatim_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hatim_id uuid NOT NULL REFERENCES public.hatims(id) ON DELETE CASCADE,
  cuz_no integer NOT NULL CHECK (cuz_no BETWEEN 1 AND 30),
  user_id uuid NOT NULL,
  participant_name text NOT NULL DEFAULT '',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hatim_id, cuz_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hatim_claims TO authenticated;
GRANT ALL ON public.hatim_claims TO service_role;
ALTER TABLE public.hatim_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "claims_select_authenticated" ON public.hatim_claims FOR SELECT TO authenticated USING (true);
CREATE POLICY "claims_insert_own" ON public.hatim_claims FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "claims_update_own_or_staff" ON public.hatim_claims FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "claims_delete_own_or_staff" ON public.hatim_claims FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE TRIGGER hatim_claims_updated_at BEFORE UPDATE ON public.hatim_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();