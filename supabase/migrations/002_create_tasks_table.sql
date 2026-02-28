-- 002_create_tasks_table.sql

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'aceptada', 'en_revision', 'en_correccion', 'aprobada')),
  precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  fecha_limite TIMESTAMPTZ,
  asignado_a UUID REFERENCES public.users(id) ON DELETE SET NULL,
  archivos_adjuntos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_estado ON public.tasks(estado);
CREATE INDEX idx_tasks_asignado_a ON public.tasks(asignado_a);
CREATE INDEX idx_tasks_fecha_limite ON public.tasks(fecha_limite);

-- Auto-update updated_at on modification
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
