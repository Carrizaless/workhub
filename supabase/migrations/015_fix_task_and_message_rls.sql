-- 015_fix_task_and_message_rls.sql
-- Fix missing INSERT/UPDATE policies for tasks (lost when 009 dropped the FOR ALL admin policy)
-- Ensure message SELECT policies let recipients see DMs addressed to them

-- ============================================================
-- FIX TASK POLICIES
-- ============================================================

-- Admin INSERT (was covered by "Admins have full access to tasks" which 009 dropped)
DROP POLICY IF EXISTS "Admins can insert tasks" ON public.tasks;
CREATE POLICY "Admins can insert tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admin UPDATE (same — was lost when 009 dropped the FOR ALL policy)
DROP POLICY IF EXISTS "Admins can update tasks" ON public.tasks;
CREATE POLICY "Admins can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- FIX MESSAGE SELECT POLICIES
-- ============================================================

-- Drop ALL old select policies on messages to avoid conflicts
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read their messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.messages;

-- Admin full access to messages
CREATE POLICY "Admins can manage all messages"
  ON public.messages FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can read messages they sent, received, or that belong to a task
CREATE POLICY "Users can read their messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    remitente_id = auth.uid()
    OR destinatario_id = auth.uid()
    OR tarea_id IS NOT NULL
  );

-- Keep existing INSERT and UPDATE policies (no changes needed)
-- "Users can send messages" — WITH CHECK (remitente_id = auth.uid())
-- "Users can mark messages as read" — already exists from 005
