-- 006_create_functions_and_triggers.sql

-- ============================================================
-- CONCURRENCY-SAFE TASK ACCEPTANCE
-- ============================================================

CREATE OR REPLACE FUNCTION public.accept_task(p_task_id UUID, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_task RECORD;
BEGIN
  -- Lock the row atomically
  SELECT id, estado, asignado_a
  INTO v_task
  FROM public.tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Tarea no encontrada');
  END IF;

  IF v_task.estado != 'pendiente' THEN
    RETURN json_build_object('success', false, 'error', 'Esta tarea ya no esta disponible');
  END IF;

  IF v_task.asignado_a IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Esta tarea ya fue tomada por otro colaborador');
  END IF;

  UPDATE public.tasks
  SET estado = 'aceptada',
      asignado_a = p_user_id,
      updated_at = NOW()
  WHERE id = p_task_id;

  RETURN json_build_object('success', true, 'message', 'Tarea aceptada exitosamente');
END;
$$;

-- ============================================================
-- TASK STATE TRANSITION VALIDATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.transition_task_state(
  p_task_id UUID,
  p_new_state TEXT,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_task RECORD;
  v_user RECORD;
  v_valid BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_task
  FROM public.tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Tarea no encontrada');
  END IF;

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
    IF (v_task.estado = 'aceptada' AND p_new_state = 'en_revision')
       OR (v_task.estado = 'en_correccion' AND p_new_state = 'en_revision') THEN
      v_valid := TRUE;
    END IF;
  END IF;

  IF NOT v_valid THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Transicion de estado no permitida: ' || v_task.estado || ' -> ' || p_new_state
    );
  END IF;

  UPDATE public.tasks
  SET estado = p_new_state,
      updated_at = NOW()
  WHERE id = p_task_id;

  RETURN json_build_object('success', true, 'message', 'Estado actualizado a: ' || p_new_state);
END;
$$;

-- ============================================================
-- AUTO-CREDIT WALLET ON TASK APPROVAL
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_task_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.estado = 'aprobada' AND OLD.estado != 'aprobada' AND NEW.asignado_a IS NOT NULL THEN
    INSERT INTO public.transactions (usuario_id, tarea_id, monto, tipo, descripcion)
    VALUES (
      NEW.asignado_a,
      NEW.id,
      NEW.precio,
      'pago_tarea',
      'Pago por tarea: ' || NEW.titulo
    );

    UPDATE public.users
    SET saldo_actual = saldo_actual + NEW.precio
    WHERE id = NEW.asignado_a;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_task_approved
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  WHEN (NEW.estado = 'aprobada' AND OLD.estado != 'aprobada')
  EXECUTE FUNCTION public.handle_task_approval();

-- Enable Realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
