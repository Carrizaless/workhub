'use client'

import { useUser } from '@/contexts/UserContext'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import CollaboratorDashboard from '@/components/dashboard/CollaboratorDashboard'
import AppLoader from '@/components/ui/AppLoader'

export default function DashboardPage() {
  const { user, profile, loading, isAdmin } = useUser()

  if (loading) {
    return <AppLoader />
  }

  // Debug: show auth state when user is null (helps diagnose production issues)
  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <p className="text-sm font-medium text-yellow-800">
            No se pudo cargar la sesión del usuario.
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Esto puede ocurrir si las variables de entorno no están configuradas correctamente
            o la sesión expiró. Intenta cerrar sesión y volver a ingresar.
          </p>
          <div className="mt-2 text-xs text-yellow-600 font-mono">
            ENV: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'URL ✓' : 'URL ✗'} | {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'KEY ✓' : 'KEY ✗'}
          </div>
        </div>
      </div>
    )
  }

  return isAdmin ? <AdminDashboard /> : <CollaboratorDashboard />
}
