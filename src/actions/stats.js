'use server'

import { createClient } from '@/lib/supabase/server'

const CONN_ERROR = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'

export async function getAdminStats() {
  const supabase = await createClient()

  try {
    // Task counts by estado
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, estado, precio, asignado_a, created_at, updated_at')

    // Total paid out (sum of approved task prices)
    const totalPagado = (tasks || [])
      .filter((t) => t.estado === 'aprobada')
      .reduce((sum, t) => sum + (t.precio || 0), 0)

    const byEstado = {
      pendiente: 0,
      aceptada: 0,
      en_revision: 0,
      en_correccion: 0,
      aprobada: 0,
    }
    ;(tasks || []).forEach((t) => {
      if (byEstado[t.estado] !== undefined) byEstado[t.estado]++
    })

    // Tareas aprobadas por mes (últimos 6 meses)
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        label: d.toLocaleDateString('es-CO', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        count: 0,
      })
    }
    ;(tasks || [])
      .filter((t) => t.estado === 'aprobada' && t.updated_at)
      .forEach((t) => {
        const d = new Date(t.updated_at)
        const m = months.find(
          (mo) => mo.year === d.getFullYear() && mo.month === d.getMonth()
        )
        if (m) m.count++
      })

    // Top 3 colaboradores (más tareas aprobadas)
    const { data: collabs } = await supabase
      .from('users')
      .select('id, nombre, email, tasks:tasks!asignado_a(id, estado)')
      .eq('role', 'colaborador')

    const topColabs = (collabs || [])
      .map((c) => ({
        ...c,
        completadas: (c.tasks || []).filter((t) => t.estado === 'aprobada').length,
      }))
      .sort((a, b) => b.completadas - a.completadas)
      .slice(0, 3)

    return {
      data: {
        total: (tasks || []).length,
        byEstado,
        totalPagado,
        months,
        topColabs,
      },
    }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}

export async function getCollaboratorStats(userId) {
  const supabase = await createClient()

  try {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, estado, precio, calificacion')
      .eq('asignado_a', userId)

    const completadas = (tasks || []).filter((t) => t.estado === 'aprobada').length
    const activas = (tasks || []).filter((t) => t.estado !== 'aprobada').length
    const totalGanado = (tasks || [])
      .filter((t) => t.estado === 'aprobada')
      .reduce((sum, t) => sum + (t.precio || 0), 0)

    const ratedTasks = (tasks || []).filter((t) => t.estado === 'aprobada' && t.calificacion)
    const avgRating = ratedTasks.length > 0
      ? ratedTasks.reduce((sum, t) => sum + t.calificacion, 0) / ratedTasks.length
      : null

    return {
      data: { completadas, activas, totalGanado, avgRating, ratingCount: ratedTasks.length },
    }
  } catch (e) {
    return { error: CONN_ERROR }
  }
}
