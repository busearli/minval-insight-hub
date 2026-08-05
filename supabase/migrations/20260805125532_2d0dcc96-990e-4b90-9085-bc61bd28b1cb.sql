ALTER TABLE public.homework ADD COLUMN IF NOT EXISTS task_type text NOT NULL DEFAULT 'onay';
ALTER TABLE public.homework ADD COLUMN IF NOT EXISTS target_pages integer NOT NULL DEFAULT 0;
ALTER TABLE public.homework_submissions ADD COLUMN IF NOT EXISTS pages_read integer NOT NULL DEFAULT 0;