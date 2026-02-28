'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const CONN_ERROR = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'

export async function createTask(formData) {
  const supabase = await createClient()

  let user
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch (e) {
    return { error: CONN_ERROR }
  }

  if (!user) return { error: 'No autenticado' }

  try {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { error: 'Solo los administradores pueden crear tareas' }
    }

    const titulo = formData.get('titulo')
    const descripcion = formData.get('descripcion')
    const precio = parseFloat(formData.get('precio'))
    const fechaLimite = formData.get('fecha_limite') || null

    if (!titulo || !precio) {
      return { error: 'Titulo y precio son obligatorios' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        titulo,
        descripcion,
        precio,
        fecha_limite: fechaLimite,
      })
      .select()
      .single()

    if (error) return { error: error.message }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    return { data }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function acceptTask(taskId) {
  const supabase = await createClient()

  let user
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch (e) {
    return { error: CONN_ERROR }
  }

  if (!user) return { error: 'No autenticado' }

  try {
    const { data, error } = await supabase.rpc('accept_task', {
      p_task_id: taskId,
      p_user_id: user.id,
    })

    if (error) return { error: error.message }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    revalidatePath(`/tasks/${taskId}`)
    return data
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function transitionTaskState(taskId, newState) {
  const supabase = await createClient()

  let user
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch (e) {
    return { error: CONN_ERROR }
  }

  if (!user) return { error: 'No autenticado' }

  try {
    const { data, error } = await supabase.rpc('transition_task_state', {
      p_task_id: taskId,
      p_new_state: newState,
      p_user_id: user.id,
    })

    if (error) return { error: error.message }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    revalidatePath(`/tasks/${taskId}`)
    revalidatePath('/wallet')
    return data
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function updateTaskFiles(taskId, files) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ archivos_adjuntos: files })
      .eq('id', taskId)

    if (error) return { error: error.message }

    revalidatePath(`/tasks/${taskId}`)
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function rateTask(taskId, rating) {
  const supabase = await createClient()

  let user
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch (e) {
    return { error: CONN_ERROR }
  }

  if (!user) return { error: 'No autenticado' }

  try {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { error: 'Solo los administradores pueden calificar tareas' }
    }

    const r = parseInt(rating, 10)
    if (isNaN(r) || r < 1 || r > 5) {
      return { error: 'La calificación debe estar entre 1 y 5' }
    }

    const { error } = await supabase
      .from('tasks')
      .update({ calificacion: r })
      .eq('id', taskId)

    if (error) return { error: error.message }

    revalidatePath(`/tasks/${taskId}`)
    revalidatePath('/colaboradores')
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function getTasks({ page = 1, pageSize = 12, filter = null, userId = null, role = null } = {}) {
  const supabase = await createClient()

  try {
    const from = (page - 1) * pageSize
    const to = page * pageSize - 1

    let query = supabase
      .from('tasks')
      .select('*, asignado:users!asignado_a(id, email, nombre)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filter) query = query.eq('estado', filter)

    const { data, error, count } = await query

    if (error) return { error: error.message }

    return {
      data,
      count,
      totalPages: Math.ceil((count || 0) / pageSize),
      page,
    }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function deleteTask(taskId) {
  const supabase = await createClient()
  const admin = createAdminClient()

  // Verify requester is admin
  let user
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch (e) {
    return { error: CONN_ERROR }
  }

  if (!user) return { error: 'No autenticado' }

  try {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { error: 'Solo los administradores pueden eliminar tareas' }
    }

    // Fetch files to clean up from storage
    const { data: task } = await supabase
      .from('tasks')
      .select('archivos_adjuntos')
      .eq('id', taskId)
      .single()

    // Delete files from storage if any
    const files = task?.archivos_adjuntos || []
    if (files.length > 0) {
      const paths = files.map((f) => f.path).filter(Boolean)
      if (paths.length > 0) {
        await admin.storage.from('task-attachments').remove(paths)
      }
    }

    // Delete task (cascades to task_history via ON DELETE CASCADE)
    const { error } = await admin
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) return { error: error.message }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}
