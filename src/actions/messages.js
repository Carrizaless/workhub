'use server'

import { createClient } from '@/lib/supabase/server'

const CONN_ERROR = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'

function sanitizeText(str) {
  return (str || '').replace(/<[^>]*>/g, '').trim()
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidUUID(val) {
  return typeof val === 'string' && UUID_RE.test(val)
}

export async function getMessages({ taskId = null, isSoporte = false, otherUserId = null }) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado', data: [] }

    let query = supabase
      .from('messages')
      .select('*, archivos, remitente:users!remitente_id(id, email, nombre, avatar_url)')
      .order('created_at', { ascending: true })

    if (taskId) {
      if (!isValidUUID(taskId)) return { error: 'ID de tarea inválido', data: [] }
      query = query.eq('tarea_id', taskId)
    } else if (isSoporte && otherUserId) {
      if (!isValidUUID(otherUserId)) return { error: 'ID de usuario inválido', data: [] }
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

export async function sendMessageAction({ contenido, taskId = null, isSoporte = false, otherUserId = null, archivos = null }) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const sanitized = sanitizeText(contenido)

    const messageData = {
      contenido: sanitized,
      remitente_id: user.id,
      es_soporte: isSoporte,
      ...(taskId ? { tarea_id: taskId } : {}),
      ...(isSoporte && otherUserId && isValidUUID(otherUserId) ? { destinatario_id: otherUserId } : {}),
      ...(archivos && archivos.length > 0 ? { archivos } : {}),
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

export async function getNotifications() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado', data: { messages: [], history: [] } }

    // Unread messages not sent by current user
    const { data: messages } = await supabase
      .from('messages')
      .select('id, contenido, created_at, remitente:users!remitente_id(nombre, email), tarea_id')
      .neq('remitente_id', user.id)
      .eq('leido', false)
      .order('created_at', { ascending: false })
      .limit(8)

    // Recent task history (changes by others)
    let history = []
    try {
      const res = await supabase
        .from('task_history')
        .select('id, task_id, estado_anterior, estado_nuevo, created_at, task:tasks!task_id(id, titulo), usuario:users!user_id(nombre, email)')
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8)
      history = res.data || []
    } catch {
      history = []
    }

    return { data: { messages: messages || [], history } }
  } catch (e) {
    return { error: CONN_ERROR, data: { messages: [], history: [] } }
  }
}

export async function getUnreadCounts() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado', data: { total: 0, dms: 0 } }

    const { count: total } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .neq('remitente_id', user.id)
      .eq('leido', false)

    const { count: dms } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .neq('remitente_id', user.id)
      .eq('es_soporte', true)
      .eq('leido', false)

    return { data: { total: total || 0, dms: dms || 0 } }
  } catch (e) {
    return { error: CONN_ERROR, data: { total: 0, dms: 0 } }
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

/**
 * Mark all unread messages as read for the current user.
 */
export async function markAllAsRead() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase
      .from('messages')
      .update({ leido: true })
      .neq('remitente_id', user.id)
      .eq('leido', false)

    if (error) return { error: error.message }
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

/**
 * Mark messages as read for a specific chat context (task or DM).
 */
export async function markChatAsRead({ taskId = null, isSoporte = false, otherUserId = null }) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    let query = supabase
      .from('messages')
      .update({ leido: true })
      .neq('remitente_id', user.id)
      .eq('leido', false)

    if (taskId) {
      if (!isValidUUID(taskId)) return { error: 'ID inválido' }
      query = query.eq('tarea_id', taskId)
    } else if (isSoporte && otherUserId) {
      if (!isValidUUID(otherUserId)) return { error: 'ID inválido' }
      query = query
        .eq('es_soporte', true)
        .or(`destinatario_id.eq.${user.id},remitente_id.eq.${otherUserId}`)
    } else if (isSoporte) {
      query = query.eq('es_soporte', true)
    }

    const { error } = await query
    if (error) return { error: error.message }
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}
