CREATE UNIQUE INDEX IF NOT EXISTS homework_submissions_hw_student_uidx
  ON public.homework_submissions (homework_id, student_id);

CREATE POLICY "students submit own homework insert"
ON public.homework_submissions FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()));

CREATE POLICY "students submit own homework update"
ON public.homework_submissions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()));