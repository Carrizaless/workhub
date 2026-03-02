'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getMessages, sendMessageAction, getMessageById } from '@/actions/messages'
import { createUploadUrl } from '@/actions/files'

export function useMessages({ taskId = null, isSoporte = false, otherUserId = null, userId = null }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

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
    async (contenido, files = []) => {
      if ((!contenido.trim() && files.length === 0) || !userId) return

      // Upload files first if any
      let archivos = null
      if (files.length > 0) {
        setUploading(true)
        try {
          const uploaded = []
          for (const file of files) {
            const folder = taskId ? `chat/${taskId}` : `chat/dm/${[userId, otherUserId].sort().join('-')}`
            const filePath = `${folder}/${Date.now()}-${file.name}`
            const urlResult = await createUploadUrl('task-attachments', filePath)
            if (urlResult.error || !urlResult.signedUrl) {
              console.error(`Upload URL error for ${file.name}:`, urlResult.error)
              continue
            }
            const uploadRes = await fetch(urlResult.signedUrl, {
              method: 'PUT',
              headers: { 'Content-Type': file.type },
              body: file,
            })
            if (uploadRes.ok) {
              uploaded.push({ path: filePath, name: file.name, type: file.type })
            } else {
              console.error(`Upload failed for ${file.name}:`, uploadRes.status)
            }
          }
          if (uploaded.length > 0) {
            archivos = uploaded
          }
        } catch (e) {
          console.error('File upload error:', e)
        }
        setUploading(false)
      }

      // If no text and uploads all failed, abort
      if (!contenido.trim() && (!archivos || archivos.length === 0)) return

      // Optimistic insert
      const optimistic = {
        id: `temp-${Date.now()}`,
        contenido: contenido.trim() || null,
        remitente_id: userId,
        created_at: new Date().toISOString(),
        leido: false,
        es_soporte: isSoporte,
        archivos: archivos,
        remitente: { id: userId, email: '', nombre: '', avatar_url: null },
      }
      setMessages((prev) => [...prev, optimistic])

      try {
        const result = await sendMessageAction({
          contenido: contenido.trim() || '',
          taskId,
          isSoporte,
          otherUserId,
          archivos,
        })

        if (result.error) {
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
          console.error('Send message error:', result.error)
        } else if (result.data) {
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

  return { messages, loading, uploading, sendMessage }
}
