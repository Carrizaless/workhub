'use server'

import { createClient } from '@/lib/supabase/server'

const CONN_ERROR = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'

export async function markMessagesAsRead(messageIds) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('messages')
      .update({ leido: true })
      .in('id', messageIds)

    if (error) return { error: error.message }
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}
