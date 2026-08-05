-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'instructor', 'student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','admin'))
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin')
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "super admin manages roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- 2. Profiles extensions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS program_choice text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS age_level text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending_assignment';

CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "admins update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 3. New-user handler: profile + default role (first user becomes super admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, avatar_url, phone, program_choice, age_level, notes)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url',
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'program_choice', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'age_level', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'notes', '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin') ON CONFLICT DO NOTHING;
    UPDATE public.profiles SET status = 'active' WHERE user_id = NEW.id;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Class instructors
CREATE TABLE public.class_instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_instructors TO authenticated;
GRANT ALL ON public.class_instructors TO service_role;
ALTER TABLE public.class_instructors ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.teaches_class(_user_id uuid, _class_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.class_instructors WHERE user_id = _user_id AND class_id = _class_id)
$$;

CREATE POLICY "read class instructors" ON public.class_instructors FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage class instructors" ON public.class_instructors FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 5. Students <-> auth user link
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS students_user_id_key ON public.students(user_id) WHERE user_id IS NOT NULL;

-- 6. Cuz tracking
CREATE TABLE public.cuz_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  cuz_no integer NOT NULL,
  status text NOT NULL DEFAULT 'baslanmadi',
  pages_memorized integer NOT NULL DEFAULT 0,
  feedback text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, cuz_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cuz_records TO authenticated;
GRANT ALL ON public.cuz_records TO service_role;
ALTER TABLE public.cuz_records ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER cuz_updated_at BEFORE UPDATE ON public.cuz_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Site settings module toggles
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS pre_registration_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS cuz_tracking_enabled boolean NOT NULL DEFAULT false;

-- 8. Replace legacy is_staff policies with role-aware ones
DROP POLICY IF EXISTS "classes staff manage" ON public.classes;
DROP POLICY IF EXISTS "students staff manage" ON public.students;
DROP POLICY IF EXISTS "attendance staff manage" ON public.attendance_records;
DROP POLICY IF EXISTS "homework staff manage" ON public.homework;
DROP POLICY IF EXISTS "submissions staff manage" ON public.homework_submissions;

-- classes
CREATE POLICY "classes read staff" ON public.classes FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.teaches_class(auth.uid(), id)
         OR EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND s.class_id = classes.id));
CREATE POLICY "classes admin manage" ON public.classes FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- students
CREATE POLICY "students read" ON public.students FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR user_id = auth.uid()
         OR (class_id IS NOT NULL AND public.teaches_class(auth.uid(), class_id)));
CREATE POLICY "students admin manage" ON public.students FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "students instructor update" ON public.students FOR UPDATE TO authenticated
  USING (class_id IS NOT NULL AND public.teaches_class(auth.uid(), class_id))
  WITH CHECK (class_id IS NOT NULL AND public.teaches_class(auth.uid(), class_id));

-- attendance
CREATE POLICY "attendance read" ON public.attendance_records FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.teaches_class(auth.uid(), class_id)
         OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()));
CREATE POLICY "attendance admin manage" ON public.attendance_records FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "attendance instructor manage" ON public.attendance_records FOR ALL TO authenticated
  USING (public.teaches_class(auth.uid(), class_id)) WITH CHECK (public.teaches_class(auth.uid(), class_id));

-- homework
CREATE POLICY "homework read" ON public.homework FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.teaches_class(auth.uid(), class_id)
         OR EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND s.class_id = homework.class_id));
CREATE POLICY "homework admin manage" ON public.homework FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "homework instructor manage" ON public.homework FOR ALL TO authenticated
  USING (public.teaches_class(auth.uid(), class_id)) WITH CHECK (public.teaches_class(auth.uid(), class_id));

-- submissions
CREATE POLICY "submissions read" ON public.homework_submissions FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid())
         OR EXISTS (SELECT 1 FROM public.homework h WHERE h.id = homework_id AND public.teaches_class(auth.uid(), h.class_id))
         OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()));
CREATE POLICY "submissions admin manage" ON public.homework_submissions FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "submissions instructor manage" ON public.homework_submissions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.homework h WHERE h.id = homework_id AND public.teaches_class(auth.uid(), h.class_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.homework h WHERE h.id = homework_id AND public.teaches_class(auth.uid(), h.class_id)));

-- cuz records
CREATE POLICY "cuz read" ON public.cuz_records FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid())
         OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND (s.user_id = auth.uid() OR (s.class_id IS NOT NULL AND public.teaches_class(auth.uid(), s.class_id)))));
CREATE POLICY "cuz admin manage" ON public.cuz_records FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "cuz instructor manage" ON public.cuz_records FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.class_id IS NOT NULL AND public.teaches_class(auth.uid(), s.class_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.class_id IS NOT NULL AND public.teaches_class(auth.uid(), s.class_id)));

-- 9. Site settings: only super admin writes
DROP POLICY IF EXISTS "authenticated insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "authenticated update site settings" ON public.site_settings;
CREATE POLICY "super admin insert site settings" ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin update site settings" ON public.site_settings FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- 10. Applications: staff only reads
DROP POLICY IF EXISTS "authenticated manage applications" ON public.registration_applications;
DROP POLICY IF EXISTS "authenticated update applications" ON public.registration_applications;
DROP POLICY IF EXISTS "authenticated delete applications" ON public.registration_applications;
CREATE POLICY "staff read applications" ON public.registration_applications FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "admins update applications" ON public.registration_applications FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admins delete applications" ON public.registration_applications FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));