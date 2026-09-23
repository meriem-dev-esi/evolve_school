-- ============================================================================
-- EVOLVE ACADEMY : SCRIPT SQL DE TEST DES DONNÉES RÉELLES SUPABASE
-- À exécuter dans votre Supabase SQL Editor : 
-- https://supabase.com/dashboard/project/ficrjocgrcghxrdpwbbw/sql
-- ============================================================================

-- 1. CRÉATION DE LA TABLE DES MESSAGES DIRECTS (si non existante)
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS sur direct_messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'direct_messages' AND policyname = 'Users can read their messages'
  ) THEN
    CREATE POLICY "Users can read their messages"
      ON public.direct_messages FOR SELECT
      USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'direct_messages' AND policyname = 'Users can send messages'
  ) THEN
    CREATE POLICY "Users can send messages"
      ON public.direct_messages FOR INSERT
      WITH CHECK (auth.uid() = sender_id);
  END IF;
END $$;


-- 2. INSERTION D'UN PROJET RÉEL DANS LA COMMUNAUTÉ
-- Ce projet apparaîtra instantanément sur la page http://localhost:3001/fr/community
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Récupère le premier utilisateur existant, ou utilise un UUID par défaut
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.community_projects (
      user_id,
      title,
      description,
      image_url,
      github_url,
      demo_url,
      category,
      technologies,
      likes_count,
      created_at
    )
    VALUES (
      v_user_id,
      'SaaS Facturation & Comptabilité PME Algérie',
      'Application web développée durant la formation Fullstack Next.js d''Evolve Academy. Intègre la facturation en DZD, l''export PDF conforme et la gestion de stocks.',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      'https://github.com/example/saas-facturation-dz',
      'https://facturation-algerie.vercel.app',
      'Web App',
      ARRAY['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL'],
      12,
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;


-- 3. ATTRIBUTION D'UNE FORMATION ET DE LA PROGRESSION AU PREMIER UTILISATEUR
-- Cela remplira instantanément le Dashboard avec un cours actif, une jauge à 67%,
-- et la leçon suivante prête à être reprise !
DO $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
  v_lesson_1 UUID;
  v_lesson_2 UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  -- Cours "Full Stack Web Development" déjà présent dans votre base
  SELECT id INTO v_course_id FROM public.courses WHERE id = 'a82197b8-b895-4039-9f74-fffd36162ac0' LIMIT 1;
  IF v_course_id IS NULL THEN
    SELECT id INTO v_course_id FROM public.courses LIMIT 1;
  END IF;

  IF v_user_id IS NOT NULL AND v_course_id IS NOT NULL THEN
    -- Inscription payée
    INSERT INTO public.enrollments (user_id, course_id, payment_status, enrolled_at)
    VALUES (v_user_id, v_course_id, 'paid', NOW())
    ON CONFLICT DO NOTHING;

    -- Progression sur les leçons de ce cours
    SELECT id INTO v_lesson_1 FROM public.lessons WHERE course_id = v_course_id ORDER BY order_index ASC LIMIT 1;
    SELECT id INTO v_lesson_2 FROM public.lessons WHERE course_id = v_course_id ORDER BY order_index ASC OFFSET 1 LIMIT 1;

    IF v_lesson_1 IS NOT NULL THEN
      INSERT INTO public.lesson_progress (user_id, lesson_id, progress_percentage, completed, updated_at)
      VALUES (v_user_id, v_lesson_1, 100, true, NOW())
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET progress_percentage = 100, completed = true;
    END IF;

    IF v_lesson_2 IS NOT NULL THEN
      INSERT INTO public.lesson_progress (user_id, lesson_id, progress_percentage, completed, updated_at)
      VALUES (v_user_id, v_lesson_2, 35, false, NOW())
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET progress_percentage = 35, completed = false;
    END IF;

    RAISE NOTICE 'Données de test injectées avec succès pour l''utilisateur % sur le cours %', v_user_id, v_course_id;
  ELSE
    RAISE NOTICE 'Créez d''abord un utilisateur sur http://localhost:3001/fr/sign-in puis relancez ce script.';
  END IF;
END $$;
