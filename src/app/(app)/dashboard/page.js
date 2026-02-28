'use client'

import { useUser } from '@/contexts/UserContext'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import CollaboratorDashboard from '@/components/dashboard/CollaboratorDashboard'

export default function DashboardPage() {
  const { loading, isAdmin } = useUser()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      </div>
    )
  }

  return isAdmin ? <AdminDashboard /> : <CollaboratorDashboard />
}
