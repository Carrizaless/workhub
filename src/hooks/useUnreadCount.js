'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUnreadCount(userId) {
  const [count, setCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    async function fetchCount() {
      try {
        const { count: unread } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .neq('remitente_id', userId)
          .eq('leido', false)

        setCount(unread || 0)
      } catch (e) {
        console.error('useUnreadCount fetch error:', e)
      }
    }

    fetchCount()

    let channel
    try {
      channel = supabase
        .channel('unread-count')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          if (payload.new.remitente_id !== userId) setCount((prev) => prev + 1)
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `leido=eq.true` }, () => {
          fetchCount()
        })
        .subscribe()
    } catch (e) {
      console.error('useUnreadCount subscription error:', e)
    }

    return () => {
      try { if (channel) supabase.removeChannel(channel) } catch {}
    }
  }, [userId])

  return count
}

/**
 * Counts only unread DM messages (es_soporte=true) for the sidebar badge.
 */
export function useUnreadDMs(userId) {
  const [count, setCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    async function fetchCount() {
      try {
        const { count: unread } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .neq('remitente_id', userId)
          .eq('es_soporte', true)
          .eq('leido', false)

        setCount(unread || 0)
      } catch (e) {
        console.error('useUnreadDMs fetch error:', e)
      }
    }

    fetchCount()

    let channel
    try {
      channel = supabase
        .channel(`unread-dms-${userId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          if (payload.new.remitente_id !== userId && payload.new.es_soporte) {
            setCount((prev) => prev + 1)
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `leido=eq.true` }, () => {
          fetchCount()
        })
        .subscribe()
    } catch (e) {
      console.error('useUnreadDMs subscription error:', e)
    }

    return () => {
      try { if (channel) supabase.removeChannel(channel) } catch {}
    }
  }, [userId])

  return count
}
