'use server'

import { createClient } from '@/lib/supabase/server'

const CONN_ERROR = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'

export async function getMessages({ taskId = null, isSoporte = false, otherUserId = null }) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado', data: [] }

    let query = supabase
      .from('messages')
      .select('*, remitente:users!remitente_id(id, email, nombre, avatar_url)')
      .order('created_at', { ascending: true })

    if (taskId) {
      query = query.eq('tarea_id', taskId)
    } else if (isSoporte && otherUserId) {
      query = query
        .eq('es_soporte', true)
        .is('tarea_id', null)
        .or(
          `and(remitente_id.eq.${user.id},destinatario_id.eq.${otherUserId}),and(remitente_id.eq.${otherUserId},destinatario_id.eq.${user.id})`
        )
    } else if (isSoporte) {
      query = query.eq('es_soporte', true).is('tarea_id', null)
    }

    const { data, error } = await query
    if (error) return { error: error.message, data: [] }
    return { data: data || [] }
  } catch (e) {
    return { error: CONN_ERROR, data: [] }
  }
}

export async function sendMessageAction({ contenido, taskId = null, isSoporte = false, otherUserId = null }) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const messageData = {
      contenido: contenido.trim(),
      remitente_id: user.id,
      es_soporte: isSoporte,
      ...(taskId ? { tarea_id: taskId } : {}),
      ...(isSoporte && otherUserId ? { destinatario_id: otherUserId } : {}),
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select('*, remitente:users!remitente_id(id, email, nombre, avatar_url)')
      .single()

    if (error) return { error: error.message }
    return { data }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function getMessageById(messageId) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, remitente:users!remitente_id(id, email, nombre, avatar_url)')
      .eq('id', messageId)
      .single()

    if (error) return { error: error.message }
    return { data }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

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
