-- 010_posts.sql
-- Blog/Instrucciones: table for admin to post announcements and guides

CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  creado_por UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can read posts"
  ON public.posts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can insert posts"
  ON public.posts FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update posts"
  ON public.posts FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Only admins can delete posts"
  ON public.posts FOR DELETE TO authenticated USING (public.is_admin());

-- Auto-update updated_at on edit
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
