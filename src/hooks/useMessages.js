'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMessages({ taskId = null, isSoporte = false, otherUserId = null, userId = null }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Initial fetch
  useEffect(() => {
    async function loadMessages() {
      let query = supabase
        .from('messages')
        .select('*, remitente:users!remitente_id(id, email, nombre, avatar_url)')
        .order('created_at', { ascending: true })

      if (taskId) {
        query = query.eq('tarea_id', taskId)
      } else if (isSoporte && otherUserId && userId) {
        // DM mode: conversation between userId and otherUserId
        query = query
          .eq('es_soporte', true)
          .is('tarea_id', null)
          .or(
            `and(remitente_id.eq.${userId},destinatario_id.eq.${otherUserId}),and(remitente_id.eq.${otherUserId},destinatario_id.eq.${userId})`
          )
      } else if (isSoporte) {
        query = query.eq('es_soporte', true).is('tarea_id', null)
      }

      const { data } = await query
      setMessages(data || [])
      setLoading(false)
    }

    loadMessages()
  }, [taskId, isSoporte, otherUserId, userId])

  // Realtime subscription
  useEffect(() => {
    const channelKey = taskId
      ? `task-${taskId}`
      : otherUserId && userId
      ? `dm-${[userId, otherUserId].sort().join('-')}`
      : 'soporte'

    const filter = taskId
      ? `tarea_id=eq.${taskId}`
      : `es_soporte=eq.true`

    if (!taskId && !isSoporte) return

    const channel = supabase
      .channel(`messages-${channelKey}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter,
        },
        async (payload) => {
          // For DM mode: filter to only messages between these two users
          if (isSoporte && otherUserId && userId) {
            const { remitente_id, destinatario_id } = payload.new
            const isRelevant =
              (remitente_id === userId && destinatario_id === otherUserId) ||
              (remitente_id === otherUserId && destinatario_id === userId)
            if (!isRelevant) return
          }

          const { data } = await supabase
            .from('messages')
            .select('*, remitente:users!remitente_id(id, email, nombre, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.id)) return prev
              return [...prev, data]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [taskId, isSoporte, otherUserId, userId])

  const sendMessage = useCallback(
    async (contenido) => {
      if (!contenido.trim()) return

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const messageData = {
        contenido: contenido.trim(),
        remitente_id: user.id,
        es_soporte: isSoporte,
        ...(taskId ? { tarea_id: taskId } : {}),
        ...(isSoporte && otherUserId ? { destinatario_id: otherUserId } : {}),
      }

      // Optimistic insert
      const optimistic = {
        ...messageData,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        leido: false,
        remitente: { id: user.id, email: user.email, nombre: '', avatar_url: null },
      }
      setMessages((prev) => [...prev, optimistic])

      const { error } = await supabase.from('messages').insert(messageData)

      if (error) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      }
    },
    [supabase, taskId, isSoporte, otherUserId]
  )

  return { messages, loading, sendMessage }
}
