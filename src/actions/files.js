'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const CONN_ERROR = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
const ALLOWED_EXTS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg']
const ALLOWED_BUCKETS = ['task-attachments']

function getExtension(path) {
  return (path || '').split('.').pop()?.toLowerCase()
}

export async function createUploadUrl(bucket, filePath) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    if (!ALLOWED_BUCKETS.includes(bucket)) return { error: 'Bucket no permitido' }

    const ext = getExtension(filePath)
    if (!ALLOWED_EXTS.includes(ext)) return { error: 'Tipo de archivo no permitido' }

    // Prevent path traversal
    if (filePath.includes('..')) return { error: 'Ruta inválida' }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath)

    if (error) return { error: error.message }
    return { signedUrl: data.signedUrl, path: data.path }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function getPublicUrl(bucket, filePath) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    if (!ALLOWED_BUCKETS.includes(bucket)) return { error: 'Bucket no permitido' }
    if (filePath.includes('..')) return { error: 'Ruta inválida' }

    const admin = createAdminClient()
    const { data } = admin.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { publicUrl: data.publicUrl }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function getSignedUrl(filePath) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    if (filePath.includes('..')) return { error: 'Ruta inválida' }

    const { data, error } = await supabase.storage
      .from('task-attachments')
      .createSignedUrl(filePath, 3600)

    if (error) return { error: error.message }
    return { url: data.signedUrl }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function deleteFile(filePath, taskId) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Prevent path traversal
    if (filePath.includes('..')) return { error: 'Ruta inválida' }

    // Validate file belongs to this task
    if (!filePath.startsWith(`${taskId}/`)) return { error: 'Archivo no pertenece a esta tarea' }

    const { error } = await supabase.storage
      .from('task-attachments')
      .remove([filePath])

    if (error) return { error: error.message }

    revalidatePath(`/tasks/${taskId}`)
    return { success: true }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}
