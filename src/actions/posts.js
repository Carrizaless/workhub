'use server'

import { createClient } from '@/lib/supabase/server'

export async function getPosts({ page = 1, pageSize = 8 } = {}) {
  try {
    const supabase = await createClient()
    const from = (page - 1) * pageSize
    const to = page * pageSize - 1

    const { data, error, count } = await supabase
      .from('posts')
      .select('id, titulo, contenido, imagen_url, created_at, creado_por:users!creado_por(nombre, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return { error: error.message }
    return {
      data,
      count,
      totalPages: Math.ceil((count || 0) / pageSize),
      page,
    }
  } catch {
    return { error: 'Error de conexión.' }
  }
}

export async function getPost(id) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('id, titulo, contenido, imagen_url, created_at, updated_at, creado_por:users!creado_por(nombre, email)')
      .eq('id', id)
      .single()

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Error de conexión.' }
  }
}

export async function createPost(formData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const titulo = formData.get('titulo')?.toString().trim()
    const contenido = formData.get('contenido')?.toString().trim()

    if (!titulo) return { error: 'El título es requerido' }
    if (!contenido) return { error: 'El contenido es requerido' }

    const { data, error } = await supabase
      .from('posts')
      .insert({ titulo, contenido, creado_por: user.id })
      .select('id')
      .single()

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Error de conexión.' }
  }
}

export async function updatePost(id, formData) {
  try {
    const supabase = await createClient()
    const titulo = formData.get('titulo')?.toString().trim()
    const contenido = formData.get('contenido')?.toString().trim()

    if (!titulo) return { error: 'El título es requerido' }
    if (!contenido) return { error: 'El contenido es requerido' }

    const { error } = await supabase
      .from('posts')
      .update({ titulo, contenido })
      .eq('id', id)

    if (error) return { error: error.message }
    return { success: true }
  } catch {
    return { error: 'Error de conexión.' }
  }
}

export async function updatePostImage(id, imageUrl) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('posts')
      .update({ imagen_url: imageUrl })
      .eq('id', id)

    if (error) return { error: error.message }
    return { success: true }
  } catch {
    return { error: 'Error de conexión.' }
  }
}

export async function deletePost(id) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) return { error: error.message }
    return { success: true }
  } catch {
    return { error: 'Error de conexión.' }
  }
}
