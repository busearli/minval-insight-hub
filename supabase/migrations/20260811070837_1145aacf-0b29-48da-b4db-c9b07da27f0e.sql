CREATE TABLE public.site_programs (
  id text PRIMARY KEY,
  emoji text NOT NULL DEFAULT '',
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'risale',
  category_label text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT '',
  fee text NOT NULL DEFAULT '',
  paid boolean NOT NULL DEFAULT false,
  soon boolean NOT NULL DEFAULT false,
  quote text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  instructor text NOT NULL DEFAULT '',
  schedule text NOT NULL DEFAULT '',
  badges_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  groups_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  books_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  curriculum_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_programs TO authenticated;
GRANT ALL ON public.site_programs TO service_role;

ALTER TABLE public.site_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_programs_public_read" ON public.site_programs
  FOR SELECT TO anon, authenticated USING (is_published OR public.is_staff(auth.uid()));
CREATE POLICY "site_programs_staff_write" ON public.site_programs
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER site_programs_updated_at BEFORE UPDATE ON public.site_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.site_timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day text NOT NULL,
  time text NOT NULL DEFAULT '',
  program_id text REFERENCES public.site_programs(id) ON DELETE CASCADE,
  group_label text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_timetable TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_timetable TO authenticated;
GRANT ALL ON public.site_timetable TO service_role;

ALTER TABLE public.site_timetable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_timetable_public_read" ON public.site_timetable
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_timetable_staff_write" ON public.site_timetable
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER site_timetable_updated_at BEFORE UPDATE ON public.site_timetable
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_programs (id, emoji, title, subtitle, category, category_label, audience, fee, paid, soon, quote, description, instructor, schedule, badges_json, groups_json, books_json, curriculum_json, sort_order) VALUES
('risale','📖','Minval Risale','Risale Okulları','risale','Risale Okulları','Hanımlara Özel (16 yaş+)','Ücretsiz',false,false,'Söz, mana ile beraber gönle nüzul eder; fakat idrak, terbiye ister.','Risale-i Nur tefekkür halkaları; imandan tevhide kademeli olarak ilerleyen bir müzakere mektebi.','Minval Risale Okulu müzakere ekibi','Hafta içi gündüz ve akşam grupları · Haftada 1 oturum (90 dk)','["Hanımlara Özel (16 yaş+)","Ücretsiz","Kontenjanlı & Devam Zorunlu"]','[{"label":"Başlangıç Düzey","items":["Grup 1","Grup 2"]},{"label":"Orta Düzey","items":["Grup 1"]},{"label":"Orta Düzey N2","items":["Grup 1"]},{"label":"Kavram Odaklı","items":["Grup 1"]},{"label":"Akşam Grubu","items":["Başlangıç Düzey"]},{"label":"Online Risale Okulu","items":["Grup 1","Orta Düzey"]}]','["Sözler","Mektubat (seçme bahisler)","Küçük Sözler","Haftalık müzakere notları"]','[{"week":"1–4. Hafta","topic":"Usul: Risale metnine nasıl yaklaşılır, kavram haritası"},{"week":"5–8. Hafta","topic":"İman ve marifetullah bahisleri; Küçük Sözler müzakeresi"},{"week":"9–12. Hafta","topic":"Haşir ve nübüvvet bahislerine giriş"},{"week":"13–16. Hafta","topic":"Tevhid ekseninde bütüncül okuma ve dönem değerlendirmesi"}]',1),
('tefsir','📗','Tefsir','Asrın Diliyle Kur''an Okumaları','tefsir-hadis','Tefsir & Hadis','Hanımlara Özel (16 yaş+)','Ücretsiz',false,false,'Kelam, indiği çağı aşar; ama anlaşılmak için mütemadiyen kendi çağını bulmalıdır.','Ayetlerin bugünün diline ve meselelerine dokunan, sakin ve derinlikli tefsir okumaları.','Minval Tefsir halkası hocası','Gündüz grubu · Haftada 1 oturum (75 dk)','["Hanımlara Özel (16 yaş+)","Ücretsiz","Devam Zorunluluğu Yoktur"]','[{"label":"Gündüz","items":["1. Grup"]}]','["Kur''an-ı Kerim Meali","Seçme tefsir metinleri","Ders föyleri"]','[{"week":"1–3. Hafta","topic":"Tefsir usulüne giriş: sebeb-i nüzul ve siyak"},{"week":"4–8. Hafta","topic":"Kısa sureler ekseninde tematik okuma"},{"week":"9–12. Hafta","topic":"Ahlak ve muamelat ayetleri; çağdaş meselelerle irtibat"}]',2),
('hadis','📜','Minval Hadis','Hadis Okumaları','tefsir-hadis','Tefsir & Hadis','Hanımlara Özel (16 yaş+)','Ücretsiz',false,false,'Söz Resûl''ündür; şerh, ona yaklaşan aklın alçakgönüllü çabasıdır.','Rivayet ve şerh geleneği içinde, hadis metinlerinin usulünce müzakeresi.','Minval Hadis halkası hocası','Haftada 1 oturum (75 dk)','["Hanımlara Özel (16 yaş+)","Ücretsiz","Devam Zorunluluğu Yoktur"]','[{"label":"Gruplar","items":["Grup 1"]}]','["Riyâzü''s-Sâlihîn","Kırk Hadis derlemesi","Şerh notları"]','[{"week":"1–3. Hafta","topic":"Hadis usulü: rivayet, sened ve metin"},{"week":"4–8. Hafta","topic":"İhlas, niyet ve ahlak hadisleri"},{"week":"9–12. Hafta","topic":"Muaşeret ve toplumsal hayat hadisleri"}]',3),
('psikoloji','🧠','Minval Psikoloji','Psikoloji Okumaları','psikoloji','Psikoloji Okumaları','Hanımlara Özel (16 yaş+)','Ücretli (Detaylar için iletişime geçiniz)',true,false,'Nefsini bilen, Rabbini bilir; fakat nefsi bilmek de bir ilim ve emek işidir.','Modern psikoloji birikimini insanın manevi dünyasıyla birlikte okuyan atölye programı.','Uzman psikolog eşliğinde okuma grubu','Haftada 1 oturum (90 dk) · Üç ayrı grup saati','["Hanımlara Özel (16 yaş+)","Ücretli (Detaylar için iletişime geçiniz)"]','[{"label":"Gruplar","items":["Grup 1","Grup 2","Grup 3"]}]','["Seçme psikoloji makaleleri","Vaka çalışması föyleri","Tavsiye okuma listesi"]','[{"week":"1–3. Hafta","topic":"İnsan tasavvuru: modern psikoloji ve gelenek"},{"week":"4–7. Hafta","topic":"Duygu düzenleme, kaygı ve maneviyat"},{"week":"8–12. Hafta","topic":"İlişkiler, aile ve şahsiyet gelişimi"}]',4),
('genc','🌱','Minval Genç','Minval MAG','genc','Minval Genç / MAG','Sadece Kız Öğrenciler','Ücretsiz',false,false,'Genç akıl, henüz yönünü arayan bir pusuladır; ona ihtiyacı olan, dayatma değil, yol arkadaşlığıdır.','Ortaokuldan üniversiteye, yaş gruplarına göre kurgulanmış gençlik halkaları.','Minval Genç rehber ekibi','Hafta sonu · Yaş gruplarına göre ayrı saatler','["Sadece Kız Öğrenciler","Ücretsiz"]','[{"label":"Ortaokul","items":["Grup 1","Grup 2"]},{"label":"Lise","items":["Grup 1"]},{"label":"Üniversite","items":["Grup 1"]}]','["Gençlik Rehberi","Seçme kısa metinler","Atölye çalışma kağıtları"]','[{"week":"1–4. Hafta","topic":"Kimlik, alışkanlıklar ve zaman"},{"week":"5–8. Hafta","topic":"Okuma alışkanlığı ve tefekkür atölyeleri"},{"week":"9–12. Hafta","topic":"Sosyal sorumluluk ve proje çalışması"}]',5),
('sanat','🎨','Minval Sanat','Yakında','sanat','Minval Sanat','Herkese açık','Yakında',false,true,'Güzellik, hakikatin gözle görülen tercümesidir.','Hat, ebru ve estetik üzerine atölyelerimiz hazırlanıyor.','Atölye eğitmenleri açıklanacak','Program takvimi yakında duyurulacak','["Yakında / Detaylar Eklenecek"]','[]','[]','[]',6);

INSERT INTO public.site_timetable (day, time, program_id, group_label, sort_order) VALUES
('Pazartesi','10:30','risale','Başlangıç Düzey · Grup 1',1),
('Pazartesi','20:00','risale','Akşam Grubu',2),
('Salı','11:00','tefsir','Gündüz · 1. Grup',3),
('Salı','14:00','psikoloji','Grup 1',4),
('Çarşamba','10:30','risale','Orta Düzey · Grup 1',5),
('Çarşamba','19:30','risale','Online Risale Okulu',6),
('Perşembe','11:00','hadis','Grup 1',7),
('Perşembe','14:30','psikoloji','Grup 2',8),
('Cuma','10:30','risale','Kavram Odaklı · Grup 1',9),
('Cuma','15:00','psikoloji','Grup 3',10),
('Cumartesi','11:00','genc','Ortaokul · Grup 1',11),
('Cumartesi','13:30','genc','Lise · Grup 1',12),
('Cumartesi','16:00','risale','Orta Düzey N2 · Grup 1',13),
('Pazar','12:00','genc','Üniversite · Grup 1',14),
('Pazar','15:00','genc','Ortaokul · Grup 2',15);