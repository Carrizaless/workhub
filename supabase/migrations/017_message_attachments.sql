-- 017_message_attachments.sql
-- Add file attachments support to chat messages.
-- archivos column stores a JSONB array of { path, name, type } objects.

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS archivos JSONB DEFAULT NULL;

-- Allow contenido to be empty when there are attachments
ALTER TABLE public.messages
  ALTER COLUMN contenido DROP NOT NULL;
