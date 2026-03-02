-- 018_fix_collaborator_mark_read.sql
-- Allow collaborators to mark messages as read (update leido field).
-- The previous UPDATE policy only allowed admins. Collaborators need to
-- update messages where they are the recipient (destinatario_id) or
-- where the message belongs to a task assigned to them.

DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;

CREATE POLICY "Users can mark messages as read"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    -- Recipient of a DM
    destinatario_id = auth.uid()
    -- OR message is on a task assigned to them
    OR (
      tarea_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = messages.tarea_id
        AND tasks.asignado_a = auth.uid()
      )
    )
  )
  WITH CHECK (
    destinatario_id = auth.uid()
    OR (
      tarea_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = messages.tarea_id
        AND tasks.asignado_a = auth.uid()
      )
    )
  );
