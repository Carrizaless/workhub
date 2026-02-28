'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData) {
  const supabase = await createClient()

  let authResult
  try {
    authResult = await supabase.auth.signInWithPassword({
      email: formData.get('email'),
      password: formData.get('password'),
    })
  } catch (e) {
    return { error: 'Error de conexión. Verifica tu internet e inténtalo de nuevo.' }
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

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  try {
    await supabase.auth.signOut()
  } catch (e) {
    // Ignore sign-out errors
  }
  redirect('/login')
}
