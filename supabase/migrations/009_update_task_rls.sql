-- 009_update_task_rls.sql
-- Allow ALL authenticated users to see ALL tasks.
-- The 3-section UI in tasks/page.js handles visual separation.
-- Previously, collaborators could only see 'pendiente' tasks + their own.

-- ============================================================
-- DROP OLD RESTRICTIVE SELECT POLICIES ON TASKS
-- ============================================================

-- Drop any variant of the collaborator view policy (use IF EXISTS to be safe)
DROP POLICY IF EXISTS "Colaboradores can view available and own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Collaborators can view available and own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Collaborators can view available tasks and their own" ON public.tasks;
DROP POLICY IF EXISTS "Colaboradores pueden ver tareas disponibles o propias" ON public.tasks;

-- Drop the admin-only view policy too, since we'll replace with a unified one
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins have full access to tasks" ON public.tasks;

-- ============================================================
-- CREATE UNIFIED SELECT POLICY
-- ============================================================

-- All authenticated users (admin + collaborador) can see all tasks.
-- This powers the "En Progreso por Otros" motivational section.
CREATE POLICY "Authenticated users can view all tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- KEEP WRITE POLICIES RESTRICTED
-- ============================================================
-- INSERT: only admins (existing policy should remain)
-- UPDATE: handled by the RPC functions (accept_task, transition_task_state)
-- DELETE: only admins — create if not already present

DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;

CREATE POLICY "Admins can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (public.is_admin());
