-- Add imagen_url column to posts table for optional cover images
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS imagen_url TEXT;
