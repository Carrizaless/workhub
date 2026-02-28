'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  const mountedRef = useRef(true)

  const fetchNotifications = useCallback(async () => {
    if (!userId || !mountedRef.current) return

    try {
      // Fetch unread messages (not sent by current user)
      const { data: messages } = await supabase
        .from('messages')
        .select('id, contenido, created_at, remitente:users!remitente_id(nombre, email), tarea_id')
        .neq('remitente_id', userId)
        .eq('leido', false)
        .order('created_at', { ascending: false })
        .limit(8)

      // Fetch recent task history (changes made by others)
      const { data: history } = await supabase
        .from('task_history')
        .select('id, task_id, estado_anterior, estado_nuevo, created_at, task:tasks!task_id(id, titulo), usuario:users!user_id(nombre, email)')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(8)

      if (!mountedRef.current) return

      const msgNotifs = (messages || []).map((m) => ({
        id: `msg-${m.id}`,
        type: 'message',
        title: 'Nuevo mensaje',
        text: m.contenido?.substring(0, 60) + (m.contenido?.length > 60 ? '...' : ''),
        from: m.remitente?.nombre || m.remitente?.email || 'Alguien',
        time: m.created_at,
        unread: true,
        href: m.tarea_id ? `/tasks/${m.tarea_id}` : '/chat',
      }))

      const historyNotifs = (history || []).map((h) => ({
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
      setUnreadCount((messages || []).length)
    } catch {
      // Silently fail (e.g. task_history table not yet created)
    }
  }, [userId])

  useEffect(() => {
    mountedRef.current = true
    fetchNotifications()

    if (!userId) return

    const channel = supabase
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

    return () => {
      mountedRef.current = false
      supabase.removeChannel(channel)
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
