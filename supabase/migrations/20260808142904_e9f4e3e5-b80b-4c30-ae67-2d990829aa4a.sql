-- 1. Public class list for signup
GRANT SELECT ON public.classes TO anon;
CREATE POLICY "public read classes" ON public.classes FOR SELECT TO anon USING (true);

-- 2. requested class
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS requested_class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL;
ALTER TABLE public.registration_applications ADD COLUMN IF NOT EXISTS requested_class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL;

-- 3. instructors may approve applications for their own class
CREATE POLICY "instructors update own class applications" ON public.registration_applications
FOR UPDATE TO authenticated
USING (public.teaches_class(auth.uid(), requested_class_id) OR public.teaches_class(auth.uid(), assigned_class_id))
WITH CHECK (public.teaches_class(auth.uid(), requested_class_id) OR public.teaches_class(auth.uid(), assigned_class_id));

-- allow instructors to activate profiles of their own class requests
CREATE POLICY "instructors update requested profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (public.teaches_class(auth.uid(), requested_class_id))
WITH CHECK (public.teaches_class(auth.uid(), requested_class_id));

-- 4. class materials
CREATE TABLE public.class_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  file_path text NOT NULL,
  file_name text NOT NULL DEFAULT '',
  file_size integer NOT NULL DEFAULT 0,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_materials TO authenticated;
GRANT ALL ON public.class_materials TO service_role;

ALTER TABLE public.class_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materials read" ON public.class_materials FOR SELECT TO authenticated
USING (
  public.is_admin(auth.uid())
  OR public.teaches_class(auth.uid(), class_id)
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND s.class_id = class_materials.class_id)
);

CREATE POLICY "materials manage" ON public.class_materials FOR ALL TO authenticated
USING (public.is_admin(auth.uid()) OR public.teaches_class(auth.uid(), class_id))
WITH CHECK (public.is_admin(auth.uid()) OR public.teaches_class(auth.uid(), class_id));

CREATE TRIGGER class_materials_updated_at BEFORE UPDATE ON public.class_materials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();