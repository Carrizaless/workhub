-- 008_task_history.sql
-- Audit log: tracks every state change on tasks (who changed what and when)

-- ============================================================
-- CREATE TABLE
-- ============================================================

CREATE TABLE public.task_history (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id     UUID         NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id     UUID         REFERENCES public.users(id) ON DELETE SET NULL,
  estado_anterior TEXT,
  estado_nuevo    TEXT     NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Index for fast lookups by task
CREATE INDEX idx_task_history_task_id ON public.task_history(task_id);

-- ============================================================
-- ENABLE RLS
-- ============================================================

ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all task history"
  ON public.task_history FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Collaborators can view history of their tasks"
  ON public.task_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_history.task_id
        AND tasks.asignado_a = auth.uid()
    )
  );

-- ============================================================
-- UPDATE accept_task TO LOG HISTORY
-- ============================================================

CREATE OR REPLACE FUNCTION public.accept_task(p_task_id UUID, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_task RECORD;
BEGIN
  -- Lock the row atomically to prevent double-acceptance
  SELECT id, estado, asignado_a
  INTO v_task
  FROM public.tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Tarea no encontrada');
  END IF;

  IF v_task.estado != 'pendiente' THEN
    RETURN json_build_object('success', false, 'error', 'Esta tarea ya no está disponible');
  END IF;

  IF v_task.asignado_a IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Esta tarea ya fue tomada por otro colaborador');
  END IF;

  -- Accept the task
  UPDATE public.tasks
  SET estado    = 'aceptada',
      asignado_a = p_user_id,
      updated_at  = NOW()
  WHERE id = p_task_id;

  -- Log to audit history
  INSERT INTO public.task_history (task_id, user_id, estado_anterior, estado_nuevo)
  VALUES (p_task_id, p_user_id, 'pendiente', 'aceptada');

  RETURN json_build_object('success', true, 'message', 'Tarea aceptada exitosamente');
END;
$$;

-- ============================================================
-- UPDATE transition_task_state TO LOG HISTORY
-- ============================================================

CREATE OR REPLACE FUNCTION public.transition_task_state(
  p_task_id  UUID,
  p_new_state TEXT,
  p_user_id  UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_task      RECORD;
  v_user      RECORD;
  v_valid     BOOLEAN := FALSE;
  v_old_state TEXT;
BEGIN
  SELECT * INTO v_task
  FROM public.tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Tarea no encontrada');
  END IF;

  v_old_state := v_task.estado;

  SELECT * INTO v_user
  FROM public.users
  WHERE id = p_user_id;

  IF v_user.role = 'admin' THEN
    IF (v_task.estado = 'en_revision' AND p_new_state IN ('aprobada', 'en_correccion')) THEN
      v_valid := TRUE;
    END IF;
  ELSIF v_user.role = 'colaborador' THEN
    IF v_task.asignado_a != p_user_id THEN
      RETURN json_build_object('success', false, 'error', 'No tienes permiso para modificar esta tarea');
    END IF;
    IF (v_task.estado = 'aceptada'     AND p_new_state = 'en_revision')
    OR (v_task.estado = 'en_correccion' AND p_new_state = 'en_revision') THEN
      v_valid := TRUE;
    END IF;
  END IF;

  IF NOT v_valid THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Transición no permitida: ' || v_task.estado || ' → ' || p_new_state
    );
  END IF;

  -- Update state
  UPDATE public.tasks
  SET estado     = p_new_state,
      updated_at = NOW()
  WHERE id = p_task_id;

  -- Log to audit history
  INSERT INTO public.task_history (task_id, user_id, estado_anterior, estado_nuevo)
  VALUES (p_task_id, p_user_id, v_old_state, p_new_state);

  RETURN json_build_object('success', true, 'message', 'Estado actualizado a: ' || p_new_state);
END;
$$;
