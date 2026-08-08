DROP POLICY IF EXISTS "read class instructors" ON public.class_instructors;

CREATE POLICY "class_instructors_scoped_select"
ON public.class_instructors
FOR SELECT
TO authenticated
USING (
  public.is_staff(auth.uid())
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
      AND s.class_id = class_instructors.class_id
  )
);

DROP POLICY IF EXISTS "claims_select_authenticated" ON public.hatim_claims;

CREATE POLICY "claims_select_scoped"
ON public.hatim_claims
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_staff(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.hatims h
    WHERE h.id = hatim_claims.hatim_id
      AND h.is_open = true
  )
);