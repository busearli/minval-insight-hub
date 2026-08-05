ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_eyebrow text NOT NULL DEFAULT 'Minval Akademi | Kahve',
  ADD COLUMN IF NOT EXISTS hero_title text NOT NULL DEFAULT 'İlim, Hikmet ve Güzel Ahlak Ekseninde Bir Gelecek',
  ADD COLUMN IF NOT EXISTS hero_subtitle text NOT NULL DEFAULT 'Maneviyat, kültür ve sanatı bir arada yaşatmayı hedefleyen bağımsız eğitim ve gönül merkezi.',
  ADD COLUMN IF NOT EXISTS about_quote text NOT NULL DEFAULT 'Minval Akademi, ilim, hikmet ve güzel ahlak ekseninde; insanın aklına, kalbine ve hayatına dokunmayı amaçlayan bağımsız bir ilim, kültür ve gençlik hareketidir.',
  ADD COLUMN IF NOT EXISTS programs_heading text NOT NULL DEFAULT 'Açık okuma halkalarımız',
  ADD COLUMN IF NOT EXISTS schedule_heading text NOT NULL DEFAULT 'Hangi grup, hangi gün?',
  ADD COLUMN IF NOT EXISTS cta_title text NOT NULL DEFAULT 'Ön kayıt formu ile başlayın',
  ADD COLUMN IF NOT EXISTS cta_text text NOT NULL DEFAULT 'Formu doldurun; kontenjan durumuna göre kurumsal WhatsApp hattımızdan sizinle iletişime geçelim.',
  ADD COLUMN IF NOT EXISTS schedule_section_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS programs_section_enabled boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "super admin update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "super admin insert site settings" ON public.site_settings;

CREATE POLICY "admins update site settings" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admins insert site settings" ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));