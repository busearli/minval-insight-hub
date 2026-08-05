CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = 'instructor'::app_user_role
  )
$$;

DROP POLICY IF EXISTS "classes authenticated manage" ON public.classes;
DROP POLICY IF EXISTS "students authenticated manage" ON public.students;
DROP POLICY IF EXISTS "attendance authenticated manage" ON public.attendance_records;
DROP POLICY IF EXISTS "homework authenticated manage" ON public.homework;
DROP POLICY IF EXISTS "submissions authenticated manage" ON public.homework_submissions;

CREATE POLICY "classes staff manage" ON public.classes
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "students staff manage" ON public.students
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "attendance staff manage" ON public.attendance_records
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "homework staff manage" ON public.homework
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "submissions staff manage" ON public.homework_submissions
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));