-- 003_create_messages_table.sql

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contenido TEXT NOT NULL,
  remitente_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tarea_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  es_soporte BOOLEAN NOT NULL DEFAULT FALSE,
  leido BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_tarea_id ON public.messages(tarea_id);
CREATE INDEX idx_messages_es_soporte ON public.messages(es_soporte) WHERE es_soporte = TRUE;
CREATE INDEX idx_messages_unread ON public.messages(remitente_id, leido) WHERE leido = FALSE;
CREATE INDEX idx_messages_tarea_created ON public.messages(tarea_id, created_at);

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
