'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const CONN_ERROR = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'

export async function createUploadUrl(bucket, filePath) {
  const supabase = await createClient()

  try {
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
  const admin = createAdminClient()

  const { data } = admin.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return { publicUrl: data.publicUrl }
}

export async function getSignedUrl(filePath) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error) return { error: error.message }
    return { url: data.signedUrl }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function deleteFile(filePath, taskId) {
  const supabase = await createClient()

  try {
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
