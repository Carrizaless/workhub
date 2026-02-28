'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const CONN_ERROR = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'

export async function updateProfile(formData) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    const nombre = formData.get('nombre')

    const { error } = await supabase
      .from('users')
      .update({ nombre })
      .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function changePassword(formData) {
  const supabase = await createClient()

  const newPassword = formData.get('new_password')
  const confirmPassword = formData.get('confirm_password')

  if (newPassword !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden' }
  }

  if (newPassword.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) return { error: error.message }
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function getCollaborators() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado', data: [] }

    // Fetch collaborators with their tasks for stats
    const { data, error } = await supabase
      .from('users')
      .select('id, email, nombre, saldo_actual, created_at, tasks:tasks!asignado_a(id, estado, precio)')
      .eq('role', 'colaborador')
      .order('created_at', { ascending: false })

    if (error) return { error: error.message, data: [] }
    return { data: data || [] }
  } catch (e) {
    return { error: CONN_ERROR, data: [] }
  }
}

export async function createCollaborator(formData) {
  const supabase = await createClient()

  try {
    // Verify current user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { error: 'Solo los administradores pueden crear colaboradores' }
    }

    const email = formData.get('email')?.trim()
    const password = formData.get('password')
    const nombre = formData.get('nombre')?.trim()

    if (!email || !password) {
      return { error: 'Correo y contraseña son obligatorios' }
    }
    if (password.length < 6) {
      return { error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    const admin = createAdminClient()

    // Create user in Supabase Auth (email_confirm: true skips confirmation email)
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nombre },
      })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        return { error: 'Ya existe un usuario con ese correo' }
      }
      return { error: authError.message }
    }

    // Update the profile created by the trigger: set nombre + role
    await admin
      .from('users')
      .update({ nombre: nombre || email, role: 'colaborador' })
      .eq('id', authData.user.id)

    revalidatePath('/colaboradores')
    revalidatePath('/dashboard')
    return { data: authData.user }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function updateBinanceId(binanceId) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase
      .from('users')
      .update({ binance_id: binanceId?.trim() || null })
      .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/wallet')
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function updateAvatar(avatarUrl) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function getCollaboratorsWithBinance() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado', data: [] }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, nombre, saldo_actual, created_at, binance_id, avatar_url, tasks:tasks!asignado_a(id, estado, precio, calificacion)')
      .eq('role', 'colaborador')
      .order('created_at', { ascending: false })

    if (error) return { error: error.message, data: [] }
    return { data: data || [] }
  } catch (e) {
    return { error: CONN_ERROR, data: [] }
  }
}

export async function deleteCollaborator(collaboratorId) {
  const supabase = await createClient()

  try {
    // Verify requester is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { error: 'Solo los administradores pueden eliminar colaboradores' }
    }

    const admin = createAdminClient()

    // Unassign their active tasks (reset to pendiente so others can accept them)
    await admin
      .from('tasks')
      .update({ asignado_a: null, estado: 'pendiente', updated_at: new Date().toISOString() })
      .eq('asignado_a', collaboratorId)
      .not('estado', 'eq', 'aprobada') // keep completed ones for audit

    // Delete public.users row (admin bypasses RLS)
    await admin.from('users').delete().eq('id', collaboratorId)

    // Delete from Supabase Auth
    const { error: authError } = await admin.auth.admin.deleteUser(collaboratorId)
    if (authError) return { error: authError.message }

    revalidatePath('/colaboradores')
    revalidatePath('/dashboard')
    revalidatePath('/tasks')
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}
