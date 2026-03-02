'use server'

import { createClient } from '@/lib/supabase/server'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Admin stats:
 * - total tasks
 * - tasks by estado
 * - total paid (SUM of transactions.monto where tipo='credito')
 * - approved tasks per month (last 6 months) → for chart
 * - top 3 collaborators by approved tasks
 */
export async function getAdminStats() {
  try {
    const supabase = await createClient()

    const [tasksRes, txRes, collabsRes] = await Promise.all([
      // All tasks to count by estado
      supabase.from('tasks').select('id, estado, created_at'),
      // Sum of payments
      supabase
        .from('transactions')
        .select('monto')
        .eq('tipo', 'pago_tarea'),
      // All collaborators with their approved tasks
      supabase
        .from('users')
        .select('id, nombre, email, tasks!asignado_a(id, estado, created_at)')
        .eq('role', 'colaborador'),
    ])

    const tasks = tasksRes.data || []
    const transactions = txRes.data || []
    const collabs = collabsRes.data || []

    // Count by estado
    const byEstado = tasks.reduce((acc, t) => {
      acc[t.estado] = (acc[t.estado] || 0) + 1
      return acc
    }, {})

    // Total paid
    const totalPagado = transactions.reduce((sum, tx) => sum + (tx.monto || 0), 0)

    // Approved tasks per month (last 6 months)
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i)
      return {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: format(d, 'MMM', { locale: es }),
        start: startOfMonth(d).toISOString(),
        end: endOfMonth(d).toISOString(),
        count: 0,
      }
    })

    const approvedTasks = tasks.filter((t) => t.estado === 'aprobada')
    for (const t of approvedTasks) {
      const d = new Date(t.created_at)
      const m = months.find(
        (m) => m.year === d.getFullYear() && m.month === d.getMonth() + 1
      )
      if (m) m.count++
    }

    // Top collaborators
    const topColabs = collabs
      .map((c) => ({
        id: c.id,
        nombre: c.nombre,
        email: c.email,
        completadas: (c.tasks || []).filter((t) => t.estado === 'aprobada').length,
      }))
      .sort((a, b) => b.completadas - a.completadas)
      .slice(0, 3)

    return {
      data: {
        total: tasks.length,
        byEstado: {
          pendiente: byEstado.pendiente || 0,
          aceptada: byEstado.aceptada || 0,
          en_revision: byEstado.en_revision || 0,
          en_correccion: byEstado.en_correccion || 0,
          aprobada: byEstado.aprobada || 0,
        },
        totalPagado,
        months,
        topColabs,
      },
    }
  } catch (e) {
    console.error('getAdminStats error:', e)
    return { error: 'Error al cargar estadísticas' }
  }
}

/**
 * Collaborator personal stats:
 * - completadas (approved tasks assigned to them)
 * - totalGanado (sum of their credit transactions)
 * - avgRating (average of their rated approved tasks)
 */
export async function getCollaboratorStats(userId) {
  if (!userId) return { error: 'No userId' }

  try {
    const supabase = await createClient()

    const [tasksRes, txRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('id, estado, calificacion')
        .eq('asignado_a', userId)
        .eq('estado', 'aprobada'),
      supabase
        .from('transactions')
        .select('monto')
        .eq('usuario_id', userId)
        .eq('tipo', 'pago_tarea'),
    ])

    const tasks = tasksRes.data || []
    const transactions = txRes.data || []

    const totalGanado = transactions.reduce((sum, tx) => sum + (tx.monto || 0), 0)

    const ratedTasks = tasks.filter((t) => t.calificacion !== null && t.calificacion !== undefined)
    const avgRating =
      ratedTasks.length > 0
        ? ratedTasks.reduce((sum, t) => sum + t.calificacion, 0) / ratedTasks.length
        : null

    return {
      data: {
        completadas: tasks.length,
        totalGanado,
        avgRating,
      },
    }
  } catch (e) {
    console.error('getCollaboratorStats error:', e)
    return { error: 'Error al cargar estadísticas' }
  }
}
