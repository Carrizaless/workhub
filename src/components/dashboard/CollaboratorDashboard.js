'use client'

import { useEffect, useState } from 'react'
import { getCollaboratorDashboardData } from '@/actions/stats'
import { useUser } from '@/contexts/UserContext'
import StatsCard from './StatsCard'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { STATE_COLORS, STATE_LABELS } from '@/lib/constants'
import Badge from '@/components/ui/Badge'

export default function CollaboratorDashboard() {
  const { user, profile } = useUser()
  const [stats, setStats] = useState(null)
  const [personalStats, setPersonalStats] = useState(null)
  const [myTasks, setMyTasks] = useState([])
  const [availableTasks, setAvailableTasks] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setStats({ activas: 0, disponibles: 0, saldo: 0 })
      setError('No se pudo obtener la sesión del usuario.')
      return
    }

    async function loadData() {
      try {
        const res = await getCollaboratorDashboardData(user.id)

        if (res.error) {
          console.error('Dashboard data error:', res.error)
          setError(res.error)
          setStats({ activas: 0, disponibles: 0, saldo: profile?.saldo_actual || 0 })
          return
        }

        const { myTasks: tasks, availableTasks: available, personalStats: pStats } = res.data

        setMyTasks(tasks)
        setAvailableTasks(available)
        setPersonalStats(pStats)
        setStats({
          activas: tasks.length,
          disponibles: available.length,
          saldo: profile?.saldo_actual || 0,
        })
      } catch (e) {
        console.error('Error loading dashboard data:', e)
        setError(e?.message || 'Error al cargar datos del dashboard')
        setStats({ activas: 0, disponibles: 0, saldo: profile?.saldo_actual || 0 })
      }
    }
    loadData()
  }, [user, profile])

  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted-bg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

      {error && (
        <div className="rounded-xl border border-danger-light bg-danger-light px-4 py-3">
          <p className="text-sm font-medium text-danger">Error: {error}</p>
          <p className="text-xs text-danger/80 mt-1">Intenta recargar la pagina o cerrar sesion y volver a ingresar.</p>
        </div>
      )}

      {/* Main stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Tareas Activas"
          value={stats.activas}
          subtitle="En progreso"
          color="blue"
        />
        <StatsCard
          title="Disponibles"
          value={stats.disponibles}
          subtitle="Para aceptar"
          color="amber"
        />
        <StatsCard
          title="Mi Saldo"
          value={formatCurrency(stats.saldo)}
          subtitle="Disponible"
          color="emerald"
        />
      </div>

      {/* Personal performance card */}
      {personalStats && (personalStats.completadas > 0 || personalStats.totalGanado > 0) && (
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 transition-colors">
          <h2 className="text-sm font-medium text-foreground mb-4">Mi Desempeño</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-accent">{personalStats.completadas}</p>
              <p className="text-xs text-muted mt-0.5">Completadas</p>
            </div>
            <div>
              <p className="text-lg font-bold text-success">{formatCurrency(personalStats.totalGanado)}</p>
              <p className="text-xs text-muted mt-0.5">Total ganado</p>
            </div>
            <div>
              {personalStats.avgRating !== null ? (
                <>
                  <div className="flex items-center justify-center gap-0.5 mb-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className={`h-4 w-4 ${s <= Math.round(personalStats.avgRating) ? 'text-stat-amber' : 'text-muted-bg'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-muted">{personalStats.avgRating.toFixed(1)} / 5</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted">—</p>
                  <p className="text-xs text-muted mt-0.5">Sin calificar</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {myTasks.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm transition-colors">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium text-foreground">Mis Tareas Activas</h2>
          </div>
          <div className="divide-y divide-border">
            {myTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-muted-bg transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{task.titulo}</p>
                  <Badge className={STATE_COLORS[task.estado]}>
                    {STATE_LABELS[task.estado]}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-muted">
                  {formatCurrency(task.precio)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {availableTasks.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm transition-colors">
          <div className="border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Tareas Disponibles</h2>
            <Link href="/tasks" className="text-xs text-accent hover:text-accent-hover">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-border">
            {availableTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-muted-bg transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{task.titulo}</p>
                  <p className="text-xs text-muted">
                    {task.descripcion?.slice(0, 60)}
                    {task.descripcion?.length > 60 ? '...' : ''}
                  </p>
                </div>
                <span className="text-sm font-semibold text-success">
                  {formatCurrency(task.precio)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
