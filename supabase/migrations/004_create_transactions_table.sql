-- 004_create_transactions_table.sql

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tarea_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  monto NUMERIC(10, 2) NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'pago_tarea'
    CHECK (tipo IN ('pago_tarea', 'ajuste_manual', 'retiro')),
  descripcion TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_usuario_id ON public.transactions(usuario_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
