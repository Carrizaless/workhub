'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getNotifications } from '@/actions/messages'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const mountedRef = useRef(true)

  const fetchNotifications = useCallback(async () => {
    if (!userId || !mountedRef.current) return

    try {
      const result = await getNotifications()
      if (!mountedRef.current) return

      const messages = result.data?.messages || []
      const history = result.data?.history || []

      const msgNotifs = messages.map((m) => ({
        id: `msg-${m.id}`,
        type: 'message',
        title: 'Nuevo mensaje',
        text: m.contenido?.substring(0, 60) + (m.contenido?.length > 60 ? '...' : ''),
        from: m.remitente?.nombre || m.remitente?.email || 'Alguien',
        time: m.created_at,
        unread: true,
        href: m.tarea_id ? `/tasks/${m.tarea_id}` : '/chat',
      }))

      const historyNotifs = history.map((h) => ({
        id: `hist-${h.id}`,
        type: 'task',
        title: h.task?.titulo || 'Tarea',
        text: `${estadoLabel(h.estado_anterior)} → ${estadoLabel(h.estado_nuevo)}`,
        from: h.usuario?.nombre || h.usuario?.email || 'Sistema',
        time: h.created_at,
        unread: false,
        href: h.task?.id ? `/tasks/${h.task.id}` : (h.task_id ? `/tasks/${h.task_id}` : null),
      }))

      const all = [...msgNotifs, ...historyNotifs]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 12)

      setNotifications(all)
      setUnreadCount(messages.length)
    } catch (e) {
      console.error('useNotifications fetch error:', e)
    }
  }, [userId])

  useEffect(() => {
    mountedRef.current = true
    fetchNotifications()

    if (!userId) return

    let channel
    try {
      const supabase = createClient()
      channel = supabase
        .channel(`notifications-${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            if (payload.new.remitente_id !== userId) {
              setUnreadCount((prev) => prev + 1)
              fetchNotifications()
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'task_history' },
          (payload) => {
            if (payload.new.user_id !== userId) {
              fetchNotifications()
            }
          }
        )
        .subscribe()
    } catch (e) {
      console.error('useNotifications subscription error:', e)
    }

    return () => {
      mountedRef.current = false
      try {
        if (channel) {
          const supabase = createClient()
          supabase.removeChannel(channel)
        }
      } catch {}
    }
  }, [userId, fetchNotifications])

  function clearUnread() {
    setUnreadCount(0)
  }

  return { notifications, unreadCount, clearUnread, refresh: fetchNotifications }
}

const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  en_revision: 'En Revisión',
  en_correccion: 'En Corrección',
  aprobada: 'Aprobada',
}

function estadoLabel(estado) {
  return ESTADO_LABELS[estado] || estado || '?'
}
