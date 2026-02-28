-- 005_enable_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ==================== USERS ====================

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==================== TASKS ====================

CREATE POLICY "Admins have full access to tasks"
  ON public.tasks FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Collaborators can view available tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    estado = 'pendiente'
    OR asignado_a = auth.uid()
  );

CREATE POLICY "Collaborators can update their assigned tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (asignado_a = auth.uid())
  WITH CHECK (asignado_a = auth.uid());

-- ==================== MESSAGES ====================

CREATE POLICY "Admins can manage all messages"
  ON public.messages FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    remitente_id = auth.uid()
    OR (
      tarea_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = messages.tarea_id
        AND tasks.asignado_a = auth.uid()
      )
    )
    OR (
      es_soporte = TRUE
      AND remitente_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (remitente_id = auth.uid());

CREATE POLICY "Users can mark messages as read"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR (
      tarea_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = messages.tarea_id
        AND tasks.asignado_a = auth.uid()
      )
      AND remitente_id != auth.uid()
    )
  );

-- ==================== TRANSACTIONS ====================

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());
