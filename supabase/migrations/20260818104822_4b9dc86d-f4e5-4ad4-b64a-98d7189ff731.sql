-- 1) Öğrenci kayıtları: eğitmenler tüm öğrenci listesini görebilsin ve kendi sınıflarına ekleyebilsin
DROP POLICY IF EXISTS "students read" ON public.students;
CREATE POLICY "students read" ON public.students FOR SELECT TO authenticated
USING (is_staff(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "students instructor update" ON public.students;
CREATE POLICY "students instructor update" ON public.students FOR UPDATE TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_admin(auth.uid()) OR class_id IS NULL OR teaches_class(auth.uid(), class_id));

DROP POLICY IF EXISTS "students instructor insert" ON public.students;
CREATE POLICY "students instructor insert" ON public.students FOR INSERT TO authenticated
WITH CHECK (is_admin(auth.uid()) OR (class_id IS NOT NULL AND teaches_class(auth.uid(), class_id)));

-- 2) Duyurular: eğitmen kendi sınıflarına duyuru yazabilsin
DROP POLICY IF EXISTS "announcements instructor manage" ON public.announcements;
CREATE POLICY "announcements instructor manage" ON public.announcements FOR ALL TO authenticated
USING (class_id IS NOT NULL AND teaches_class(auth.uid(), class_id))
WITH CHECK (class_id IS NOT NULL AND teaches_class(auth.uid(), class_id));

-- 3) Ödevler: atanma tarihi
ALTER TABLE public.homework ADD COLUMN IF NOT EXISTS assigned_at date NOT NULL DEFAULT current_date;

-- 4) Etkinlik kayıtları: onay akışı
ALTER TABLE public.event_registrations ALTER COLUMN status SET DEFAULT 'beklemede';
UPDATE public.event_registrations SET status = 'onaylandi' WHERE status IS NULL OR status NOT IN ('beklemede','onaylandi','reddedildi');

CREATE OR REPLACE FUNCTION public.enforce_event_reg_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF public.is_admin(auth.uid()) THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'beklemede';
    NEW.attended := false;
  ELSE
    NEW.status := OLD.status;
    NEW.attended := OLD.attended;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS event_regs_status_guard ON public.event_registrations;
CREATE TRIGGER event_regs_status_guard BEFORE INSERT OR UPDATE ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.enforce_event_reg_status();

-- 5) Yeni kayıt: onay beklemeden öğrenci paneli açılsın
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_name text;
  v_phone text;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1));
  v_phone := COALESCE(NEW.raw_user_meta_data ->> 'phone', '');

  INSERT INTO public.profiles (user_id, name, avatar_url, phone, program_choice, age_level, notes, requested_class_id, status)
  VALUES (
    NEW.id,
    v_name,
    NEW.raw_user_meta_data ->> 'avatar_url',
    v_phone,
    COALESCE(NEW.raw_user_meta_data ->> 'program_choice', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'age_level', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'notes', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'requested_class_id', '')::uuid,
    'active'
  )
  ON CONFLICT (user_id) DO NOTHING;

  IF lower(COALESCE(NEW.email, '')) = 'admin@minvalakademi.com'
     OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  END IF;

  -- Öğrenci kaydı hemen oluşur; sınıf ataması yönetici/hoca tarafından yapılır.
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE user_id = NEW.id) THEN
    INSERT INTO public.students (full_name, phone, user_id, status)
    VALUES (v_name, v_phone, NEW.id, 'aktif');
  END IF;

  RETURN NEW;
END;
$function$;

-- Mevcut kullanıcılar için eksik öğrenci kayıtlarını tamamla
INSERT INTO public.students (full_name, phone, user_id, status)
SELECT p.name, p.phone, p.user_id, 'aktif'
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = p.user_id);