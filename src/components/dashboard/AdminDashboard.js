'use client'

import { useEffect, useState } from 'react'
import { getAdminStats } from '@/actions/stats'
import { createClient } from '@/lib/supabase/client'
import StatsCard from './StatsCard'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          getAdminStats(),
          supabase
            .from('tasks')
            .select('id, titulo, estado, precio, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        if (!statsRes.error) setStats(statsRes.data)
        else setStats({ total: 0, byEstado: { pendiente: 0, en_revision: 0, aprobada: 0 }, totalPagado: 0, months: [], topColabs: [] })
        setRecentTasks(recentRes.data || [])
      } catch (e) {
        console.error('Error loading admin stats:', e)
        setStats({ total: 0, byEstado: { pendiente: 0, en_revision: 0, aprobada: 0 }, totalPagado: 0, months: [], topColabs: [] })
      }
    }
    loadStats()
  }, [])

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    )
  }

  const maxMonth = Math.max(...stats.months.map((m) => m.count), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link href="/tasks/new">
          <Button>Nueva Tarea</Button>
        </Link>
      </div>

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
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
        <h2 className="text-sm font-medium text-gray-900 mb-4">
          Tareas completadas por mes
        </h2>
        <div className="flex items-end gap-2 h-24">
          {stats.months.map((m) => (
            <div key={`${m.year}-${m.month}`} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">
                {m.count > 0 ? m.count : ''}
              </span>
              <div
                className="w-full rounded-t-md bg-blue-500 transition-all"
                style={{
                  height: `${Math.max((m.count / maxMonth) * 64, m.count > 0 ? 8 : 2)}px`,
                  opacity: m.count > 0 ? 1 : 0.2,
                }}
              />
              <span className="text-[10px] text-gray-400 capitalize">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top collaborators */}
      {stats.topColabs.some((c) => c.completadas > 0) && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-medium text-gray-900">Top Colaboradores</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.topColabs.filter((c) => c.completadas > 0).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {c.nombre || c.email}
                  </p>
                </div>
                <span className="text-sm text-gray-500">{c.completadas} tareas</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent tasks */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-medium text-gray-900">Tareas Recientes</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {recentTasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{task.titulo}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {task.estado.replace(/_/g, ' ')}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {formatCurrency(task.precio)}
              </span>
            </Link>
          ))}
          {recentTasks.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-gray-400">
              No hay tareas aún
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
