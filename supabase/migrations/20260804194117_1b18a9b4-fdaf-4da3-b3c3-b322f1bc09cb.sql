CREATE TYPE public.app_user_role AS ENUM ('student', 'instructor');

CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  role public.app_user_role NOT NULL DEFAULT 'student',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.workshops (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  instructor_name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  total_weeks int NOT NULL DEFAULT 0,
  seats_left int NOT NULL DEFAULT 0,
  syllabus_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.workshops TO anon;
GRANT SELECT ON public.workshops TO authenticated;
GRANT ALL ON public.workshops TO service_role;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workshops public read" ON public.workshops FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workshop_id text NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  completion_rate int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, workshop_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own enrollments" ON public.enrollments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.workshops (id, title, description, instructor_name, category, price, total_weeks, seats_left, syllabus_json) VALUES
('varolusçu-edebiyat', 'Varoluşçu Edebiyat Okumaları', 'Camus, Sartre ve Oğuz Atay''ın metinleri üzerinden bireyin anlam arayışını yakın okuma yöntemiyle inceliyoruz.', 'Doç. Dr. Elif Karaman', 'Edebiyat & Yazarlık', 3200, 6, 4, '[]'::jsonb),
('cagdas-felsefe', 'Çağdaş Felsefe Okumaları', 'Foucault''dan Byung-Chul Han''a; iktidar, özne ve yorgunluk kavramlarını çağdaş metinler eşliğinde tartışıyoruz.', 'Prof. Dr. Necmi Aydın', 'Felsefe & Düşünce', 3800, 8, 6, '[]'::jsonb),
('modern-sanat', 'Modern Sanatın Kırılma Anları', 'Empresyonizmden kavramsal sanata uzanan hatta, sanatın kendi kurallarını nasıl yıktığını izliyoruz.', 'Dr. Ayşe Tunalı', 'Sanat Tarihi', 2900, 5, 9, '[]'::jsonb),
('psikanaliz-giris', 'Psikanalize Giriş: Arzu ve Dil', 'Freud ve Lacan''ın temel kavramlarını vaka örnekleri ve edebî metinlerle birlikte ele alıyoruz.', 'Uzm. Psk. Mert Soydan', 'Psikoloji', 2400, 4, 3, '[]'::jsonb),
('siir-atolyesi', 'Şiir Yazma Atölyesi: İmgenin Grameri', 'Kendi şiirinizi kurarken imge, ritim ve sessizliğin işlevini atölye eleştirisiyle birlikte çalışıyoruz.', 'Yrd. Doç. Dr. Selin Peker', 'Edebiyat & Yazarlık', 2700, 6, 5, '[]'::jsonb),
('etik-tartismalar', 'Gündelik Hayatın Etiği', 'Aristoteles''ten Levinas''a, sıradan kararlarımızın ardındaki ahlaki zemini birlikte sorguluyoruz.', 'Prof. Dr. Necmi Aydın', 'Felsefe & Düşünce', 2200, 4, 7, '[]'::jsonb);