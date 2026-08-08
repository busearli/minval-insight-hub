CREATE POLICY "class materials read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'class-materials');

CREATE POLICY "class materials write" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'class-materials' AND (public.is_staff(auth.uid())));

CREATE POLICY "class materials delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'class-materials' AND (public.is_staff(auth.uid())));