'use client'

import { useEffect, useState } from 'react'
import { getAdminStats } from '@/actions/stats'
import StatsCard from './StatsCard'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [error, setError] = useState(null)

  const emptyStats = { total: 0, byEstado: { pendiente: 0, en_revision: 0, aprobada: 0 }, totalPagado: 0, months: [], topColabs: [] }

  useEffect(() => {
    async function loadStats() {
      try {
        const statsRes = await getAdminStats()

        if (!statsRes.error) {
          setStats(statsRes.data)
          setRecentTasks(statsRes.data.recentTasks || [])
        } else {
          console.error('Admin stats error:', statsRes.error)
          setError(statsRes.error)
          setStats(emptyStats)
        }
      } catch (e) {
        console.error('Error loading admin stats:', e)
        setError(e?.message || 'Error al cargar estadísticas')
        setStats(emptyStats)
      }
    }
    loadStats()
  }, [])

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted-bg" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-2xl bg-muted-bg" />
      </div>
    )
  }

  const maxMonth = Math.max(...stats.months.map((m) => m.count), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <Link href="/tasks/new">
          <Button>Nueva Tarea</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">Error: {error}</p>
          <p className="text-xs text-red-600 mt-1">Intenta recargar la página o cerrar sesión y volver a ingresar.</p>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Tareas"
          value={stats.total}
          subtitle={`${stats.byEstado.pendiente} pendientes`}
        />
        <StatsCard
          title="En Revisión"
          value={stats.byEstado.en_revision}
          subtitle="Requieren atención"
        />
        <StatsCard
          title="Aprobadas"
          value={stats.byEstado.aprobada}
          subtitle="Completadas"
        />
        <StatsCard
          title="Total Pagado"
          value={formatCurrency(stats.totalPagado)}
          subtitle="Histórico"
        />
      </div>

      {/* Monthly chart */}
      <div className="rounded-2xl border border-border bg-card shadow-sm p-6 transition-colors">
        <h2 className="text-sm font-medium text-foreground mb-4">
          Tareas completadas por mes
        </h2>
        <div className="flex items-end gap-2 h-24">
          {stats.months.map((m) => (
            <div key={`${m.year}-${m.month}`} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs text-muted font-medium">
                {m.count > 0 ? m.count : ''}
              </span>
              <div
                className="w-full rounded-t-md bg-blue-500 transition-all"
                style={{
                  height: `${Math.max((m.count / maxMonth) * 64, m.count > 0 ? 8 : 2)}px`,
                  opacity: m.count > 0 ? 1 : 0.2,
                }}
              />
              <span className="text-[10px] text-muted capitalize">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top collaborators */}
      {stats.topColabs.some((c) => c.completadas > 0) && (
        <div className="rounded-2xl border border-border bg-card shadow-sm transition-colors">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium text-foreground">Top Colaboradores</h2>
          </div>
          <div className="divide-y divide-border">
            {stats.topColabs.filter((c) => c.completadas > 0).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted-bg text-xs font-bold text-muted">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {c.nombre || c.email}
                  </p>
                </div>
                <span className="text-sm text-muted">{c.completadas} tareas</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent tasks */}
      <div className="rounded-2xl border border-border bg-card shadow-sm transition-colors">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-medium text-foreground">Tareas Recientes</h2>
        </div>
        <div className="divide-y divide-border">
          {recentTasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="flex items-center justify-between px-6 py-3 hover:bg-muted-bg transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{task.titulo}</p>
                <p className="text-xs text-muted capitalize">
                  {task.estado.replace(/_/g, ' ')}
                </p>
              </div>
              <span className="text-sm font-medium text-muted">
                {formatCurrency(task.precio)}
              </span>
            </Link>
          ))}
          {recentTasks.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-muted">
              No hay tareas aún
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
