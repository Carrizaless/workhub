'use server'

import { createClient } from '@/lib/supabase/server'

const CONN_ERROR = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'

export async function getTransactions() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado', data: [] }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('transactions')
      .select('*, tarea:tasks!tarea_id(titulo), usuario:users!usuario_id(email, nombre)')
      .order('created_at', { ascending: false })

    // Collaborators only see their own transactions
    if (profile?.role !== 'admin') {
      query = query.eq('usuario_id', user.id)
    }

    const { data, error } = await query

    if (error) return { error: error.message, data: [] }
    return { data: data || [] }
  } catch (e) {
    return { error: CONN_ERROR, data: [] }
  }
}
