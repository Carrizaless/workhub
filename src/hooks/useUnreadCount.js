'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUnreadCounts } from '@/actions/messages'

/**
 * Single consolidated hook for all unread message counts.
 * Returns { total, dms } from one API call and one realtime subscription.
 */
export function useUnreadCounts(userId) {
  const [counts, setCounts] = useState({ total: 0, dms: 0 })

  useEffect(() => {
    if (!userId) return

    async function fetchCounts() {
      try {
        const result = await getUnreadCounts()
        setCounts({
          total: result.data?.total || 0,
          dms: result.data?.dms || 0,
        })
      } catch (e) {
        console.error('useUnreadCounts fetch error:', e)
      }
    }

    fetchCounts()

    let channel
    try {
      const supabase = createClient()
      channel = supabase
        .channel(`unread-${userId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          if (payload.new.remitente_id !== userId) {
            setCounts((prev) => ({
              total: prev.total + 1,
              dms: payload.new.es_soporte ? prev.dms + 1 : prev.dms,
            }))
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `leido=eq.true` }, () => {
          fetchCounts()
        })
        .subscribe()
    } catch (e) {
      console.error('useUnreadCounts subscription error:', e)
    }

    return () => {
      try {
        if (channel) {
          const supabase = createClient()
          supabase.removeChannel(channel)
        }
      } catch {}
    }
  }, [userId])

  return counts
}
