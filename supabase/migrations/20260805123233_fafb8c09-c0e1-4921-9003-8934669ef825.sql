CREATE POLICY "classes instructor update" ON public.classes
  FOR UPDATE TO authenticated
  USING (teaches_class(auth.uid(), id))
  WITH CHECK (teaches_class(auth.uid(), id));