'use client'

import { useEffect, useState } from 'react'
import { getAdminStats } from '@/actions/stats'
import StatsCard from './StatsCard'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import clsx from 'clsx'
import AppLoader from '@/components/ui/AppLoader'

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
    return <AppLoader />
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
        <div className="rounded-xl border border-danger-light bg-danger-light px-4 py-3">
          <p className="text-sm font-medium text-danger">Error: {error}</p>
          <p className="text-xs text-danger/80 mt-1">Intenta recargar la pagina o cerrar sesion y volver a ingresar.</p>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Tareas"
          value={stats.total}
          subtitle={`${stats.byEstado.pendiente} pendientes`}
          color="blue"
          icon={<TaskIconSmall />}
        />
        <StatsCard
          title="En Revision"
          value={stats.byEstado.en_revision}
          subtitle="Requieren atencion"
          color="amber"
          icon={<ClockIconSmall />}
        />
        <StatsCard
          title="Aprobadas"
          value={stats.byEstado.aprobada}
          subtitle="Completadas"
          color="emerald"
          icon={<CheckIconSmall />}
        />
        <StatsCard
          title="Total Pagado"
          value={formatCurrency(stats.totalPagado)}
          subtitle="Historico"
          color="violet"
          icon={<CurrencyIconSmall />}
        />
      </div>

      {/* Monthly chart */}
      <div className="rounded-2xl border border-border bg-card shadow-sm p-6 transition-all duration-200">
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
                className="w-full rounded-t-md bg-gradient-to-t from-accent to-accent/70 transition-all"
                style={{
                  height: `${Math.max((m.count / maxMonth) * 64, m.count > 0 ? 8 : 2)}px`,
                  opacity: m.count > 0 ? 1 : 0.15,
                }}
              />
              <span className="text-[10px] text-muted capitalize">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top collaborators */}
      {stats.topColabs.some((c) => c.completadas > 0) && (
        <div className="rounded-2xl border border-border bg-card shadow-sm transition-all duration-200">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium text-foreground">Top Colaboradores</h2>
          </div>
          <div className="divide-y divide-border">
            {stats.topColabs.filter((c) => c.completadas > 0).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    i === 0 ? 'bg-stat-amber-light text-stat-amber' :
                    i === 1 ? 'bg-muted-bg text-muted' :
                    'bg-muted-bg text-muted'
                  )}>
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
      <div className="rounded-2xl border border-border bg-card shadow-sm transition-all duration-200">
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
              No hay tareas aun
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function TaskIconSmall() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  )
}

function ClockIconSmall() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CheckIconSmall() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CurrencyIconSmall() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
