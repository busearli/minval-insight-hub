ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS signup_class_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS signup_class_label text NOT NULL DEFAULT 'Katılmak istediğiniz sınıf';