'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    return { error: 'Correo y contraseña son obligatorios.' }
  }

  // Check that Supabase env vars are available on the server
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      error: 'Error de configuración del servidor. Las variables de entorno de Supabase no están disponibles.',
    }
  }

  let supabase
  try {
    supabase = await createClient()
  } catch (e) {
    return { error: 'Error al crear conexión con el servidor: ' + (e.message || 'desconocido') }
  }

  let authResult
  try {
    // Add a timeout to prevent hanging forever
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo de espera agotado')), 15000)
    )
    authResult = await Promise.race([
      supabase.auth.signInWithPassword({ email, password }),
      timeoutPromise,
    ])
  } catch (e) {
    return {
      error:
        e.message === 'Tiempo de espera agotado'
          ? 'El servidor tardó demasiado en responder. Inténtalo de nuevo.'
          : 'Error de conexión. Verifica tu internet e inténtalo de nuevo.',
    }
  }

  if (authResult.error) {
    // Translate common Supabase auth errors to Spanish
    const msg = authResult.error.message
    if (msg === 'Invalid login credentials') {
      return { error: 'Correo o contraseña incorrectos.' }
    }
    if (msg === 'Email not confirmed') {
      return { error: 'Debes confirmar tu correo antes de ingresar.' }
    }
    return { error: msg }
  }

  // Return success — client handles navigation
  return { success: true }
}

export async function logout() {
  let supabase
  try {
    supabase = await createClient()
    await supabase.auth.signOut()
  } catch (e) {
    // Ignore sign-out errors
  }
  redirect('/login')
}
