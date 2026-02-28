-- 011_dm.sql
-- Add destinatario_id to messages for proper direct messaging.
-- Also update RLS so users can read messages they sent or received.

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS destinatario_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Drop old permissive/restrictive message read policies
DROP POLICY IF EXISTS "Users can read their own messages" ON public.messages;
DROP POLICY IF EXISTS "Collaborators can read support messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can read all messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read task messages" ON public.messages;

-- New unified SELECT policy:
-- A user can see a message if:
--   (a) they sent it, OR
--   (b) it is addressed to them (destinatario_id), OR
--   (c) it belongs to a task (task chat - visible to anyone who can see the task)
CREATE POLICY "Users can read their own messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    remitente_id = auth.uid()
    OR destinatario_id = auth.uid()
    OR tarea_id IS NOT NULL
  );

-- Drop old insert policy and recreate clean
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (remitente_id = auth.uid());
