ALTER TABLE public.registration_applications ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS capacity integer NOT NULL DEFAULT 0;
ALTER TABLE public.homework_submissions ADD COLUMN IF NOT EXISTS submission_text text NOT NULL DEFAULT '';
ALTER TABLE public.homework_submissions ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements admin manage" ON public.announcements FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "announcements read" ON public.announcements FOR SELECT TO authenticated USING (true);

CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "submissions student insert own" ON public.homework_submissions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = homework_submissions.student_id AND s.user_id = auth.uid()));
CREATE POLICY "submissions student update own" ON public.homework_submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = homework_submissions.student_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = homework_submissions.student_id AND s.user_id = auth.uid()));