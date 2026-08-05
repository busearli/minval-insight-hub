CREATE TABLE public.registration_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  program_id text not null default '',
  program_label text not null default '',
  age_level text not null default '',
  notes text not null default '',
  status text not null default 'bekliyor',
  assigned_class_id uuid references public.classes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT INSERT ON public.registration_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registration_applications TO authenticated;
GRANT ALL ON public.registration_applications TO service_role;
ALTER TABLE public.registration_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit application" ON public.registration_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "authenticated manage applications" ON public.registration_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated update applications" ON public.registration_applications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete applications" ON public.registration_applications FOR DELETE TO authenticated USING (true);
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.registration_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.site_settings (
  id text primary key default 'main',
  instagram_url text not null default 'https://instagram.com/minvalakademi',
  whatsapp_number text not null default '905000000000',
  phone text not null default '',
  email text not null default 'merhaba@minvalakademi.com',
  address text not null default 'Minval Kahve, İstanbul',
  intro text not null default '',
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "authenticated update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (id) VALUES ('main');