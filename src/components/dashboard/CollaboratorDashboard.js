'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCollaboratorStats } from '@/actions/stats'
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
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    async function loadData() {
      try {
        const [myTasksRes, availableRes, personalRes] = await Promise.all([
          supabase
            .from('tasks')
            .select('*')
            .eq('asignado_a', user.id)
            .neq('estado', 'aprobada')
            .order('updated_at', { ascending: false }),
          supabase
            .from('tasks')
            .select('*')
            .eq('estado', 'pendiente')
            .is('asignado_a', null)
            .order('created_at', { ascending: false })
            .limit(5),
          getCollaboratorStats(user.id),
        ])

        const tasks = myTasksRes.data || []
        setMyTasks(tasks)
        setAvailableTasks(availableRes.data || [])

        setStats({
          activas: tasks.length,
          disponibles: (availableRes.data || []).length,
          saldo: profile?.saldo_actual || 0,
        })

        if (!personalRes.error) setPersonalStats(personalRes.data)
      } catch (e) {
        console.error('Error loading dashboard data:', e)
        setStats({ activas: 0, disponibles: 0, saldo: profile?.saldo_actual || 0 })
      }
    }
    loadData()
  }, [user, profile])

  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Main stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Tareas Activas"
          value={stats.activas}
          subtitle="En progreso"
        />
        <StatsCard
          title="Disponibles"
          value={stats.disponibles}
          subtitle="Para aceptar"
        />
        <StatsCard
          title="Mi Saldo"
          value={formatCurrency(stats.saldo)}
          subtitle="Disponible"
        />
      </div>

      {/* Personal performance card */}
      {personalStats && (personalStats.completadas > 0 || personalStats.totalGanado > 0) && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Mi Desempeño</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{personalStats.completadas}</p>
              <p className="text-xs text-gray-500 mt-0.5">Completadas</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(personalStats.totalGanado)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total ganado</p>
            </div>
            <div>
              {personalStats.avgRating !== null ? (
                <>
                  <div className="flex items-center justify-center gap-0.5 mb-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className={`h-4 w-4 ${s <= Math.round(personalStats.avgRating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{personalStats.avgRating.toFixed(1)} / 5</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-400">—</p>
                  <p className="text-xs text-gray-500 mt-0.5">Sin calificar</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {myTasks.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-medium text-gray-900">Mis Tareas Activas</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {myTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.titulo}</p>
                  <Badge className={STATE_COLORS[task.estado]}>
                    {STATE_LABELS[task.estado]}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {formatCurrency(task.precio)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {availableTasks.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900">Tareas Disponibles</h2>
            <Link href="/tasks" className="text-xs text-blue-600 hover:text-blue-700">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {availableTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.titulo}</p>
                  <p className="text-xs text-gray-500">
                    {task.descripcion?.slice(0, 60)}
                    {task.descripcion?.length > 60 ? '...' : ''}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600">
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
