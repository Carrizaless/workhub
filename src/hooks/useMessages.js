'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getMessages, sendMessageAction, getMessageById } from '@/actions/messages'

export function useMessages({ taskId = null, isSoporte = false, otherUserId = null, userId = null }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  // Initial fetch via server action
  useEffect(() => {
    async function loadMessages() {
      try {
        const result = await getMessages({ taskId, isSoporte, otherUserId })
        setMessages(result.data || [])
      } catch (e) {
        console.error('useMessages load error:', e)
        setMessages([])
      }
      setLoading(false)
    }

    loadMessages()
  }, [taskId, isSoporte, otherUserId, userId])

  // Realtime subscription (for receiving new messages)
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

    let channel
    try {
      const supabase = createClient()
      channel = supabase
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
            try {
              // For DM mode: filter to only messages between these two users
              if (isSoporte && otherUserId && userId) {
                const { remitente_id, destinatario_id } = payload.new
                const isRelevant =
                  (remitente_id === userId && destinatario_id === otherUserId) ||
                  (remitente_id === otherUserId && destinatario_id === userId)
                if (!isRelevant) return
              }

              // Fetch the full message with joins via server action
              const result = await getMessageById(payload.new.id)

              if (result.data) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === result.data.id)) return prev
                  // Remove optimistic version if it exists
                  const filtered = prev.filter((m) => !String(m.id).startsWith('temp-'))
                  return [...filtered, result.data]
                })
              }
            } catch (e) {
              console.error('useMessages realtime handler error:', e)
            }
          }
        )
        .subscribe()
    } catch (e) {
      console.error('useMessages subscription error:', e)
    }

    return () => {
      try {
        if (channel) {
          const supabase = createClient()
          supabase.removeChannel(channel)
        }
      } catch {}
    }
  }, [taskId, isSoporte, otherUserId, userId])

  const sendMessage = useCallback(
    async (contenido) => {
      if (!contenido.trim() || !userId) return

      // Optimistic insert
      const optimistic = {
        id: `temp-${Date.now()}`,
        contenido: contenido.trim(),
        remitente_id: userId,
        created_at: new Date().toISOString(),
        leido: false,
        es_soporte: isSoporte,
        remitente: { id: userId, email: '', nombre: '', avatar_url: null },
      }
      setMessages((prev) => [...prev, optimistic])

      try {
        const result = await sendMessageAction({ contenido, taskId, isSoporte, otherUserId })

        if (result.error) {
          // Remove optimistic message on error
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
          console.error('Send message error:', result.error)
        } else if (result.data) {
          // Replace optimistic with real message
          setMessages((prev) => {
            const filtered = prev.filter((m) => m.id !== optimistic.id)
            if (filtered.some((m) => m.id === result.data.id)) return filtered
            return [...filtered, result.data]
          })
        }
      } catch (e) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
        console.error('useMessages send error:', e)
      }
    },
    [taskId, isSoporte, otherUserId, userId]
  )

  return { messages, loading, sendMessage }
}
