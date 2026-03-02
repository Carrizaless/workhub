'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useMessages } from '@/hooks/useMessages'
import { getSignedUrl } from '@/actions/files'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import toast from 'react-hot-toast'

export default function ChatPanel({ taskId = null, isSoporte = false, otherUserId = null }) {
  const { user } = useUser()
  const { messages, loading, uploading, sendMessage } = useMessages({
    taskId,
    isSoporte,
    otherUserId,
    userId: user?.id,
  })
  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleDownload = useCallback(async (file) => {
    try {
      const result = await getSignedUrl(file.path)
      if (result.error) {
        toast.error('Error al descargar archivo')
        return
      }
      // Open in new tab (triggers download for non-images, preview for images)
      window.open(result.url, '_blank')
    } catch {
      toast.error('Error al descargar archivo')
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
            <div className="h-10 w-48 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="max-h-96 overflow-y-auto space-y-4 py-2 pr-1">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            No hay mensajes aun. Inicia la conversacion.
          </p>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isOwn={msg.remitente_id === user?.id}
            onDownload={handleDownload}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 pt-3 mt-3">
        <ChatInput onSend={sendMessage} disabled={!user} uploading={uploading} />
      </div>
    </div>
  )
}
