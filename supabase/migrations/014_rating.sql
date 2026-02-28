-- Add calificacion column to tasks table
-- Admin can rate completed tasks on a 1-5 star scale

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS calificacion INT
  CHECK (calificacion >= 1 AND calificacion <= 5);
