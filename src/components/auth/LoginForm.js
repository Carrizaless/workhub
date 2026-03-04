'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/actions/auth'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.target)
      const result = await login(formData)

      if (result?.error) {
        toast.error(result.error)
        setLoading(false)
        return
      }

      if (result?.success) {
        // Full page reload to ensure fresh server-side session
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error('Error al conectar con el servidor. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Correo electronico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/20"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/20"
          placeholder="Tu contrasena"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
