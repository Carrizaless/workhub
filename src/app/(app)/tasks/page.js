'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { getTasks } from '@/actions/tasks'
import TaskGrid from '@/components/tasks/TaskGrid'
import TaskFilters from '@/components/tasks/TaskFilters'
import Pagination from '@/components/ui/Pagination'
import Link from 'next/link'
import Button from '@/components/ui/Button'

const PAGE_SIZE = 12

// ─── Skeleton loader ──────────────────────────────────────────
function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  )
}

// ─── Section header for collaborator view ─────────────────────
function SectionHeader({ title, count, description }) {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          {title}
          {count > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs font-medium text-gray-600">
              {count}
            </span>
          )}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────
export default function TasksPage() {
  const { user, isAdmin, loading: userLoading } = useUser()
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const supabase = createClient()

  useEffect(() => {
    if (!userLoading && isAdmin) {
      loadAdminTasks(1)
    }
  }, [filter, userLoading, isAdmin])

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      loadCollaboratorTasks()
    }
  }, [userLoading, isAdmin])

  async function loadAdminTasks(p) {
    setLoading(true)
    const result = await getTasks({
      page: p,
      pageSize: PAGE_SIZE,
      filter: filter === 'all' ? null : filter,
    })
    setTasks(result.data || [])
    setTotalPages(result.totalPages || 1)
    setPage(p)
    setLoading(false)
  }

  async function loadCollaboratorTasks() {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*, asignado:users!asignado_a(id, nombre, email)')
      .order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }

  // ── Admin view: single list with filters + pagination ──────
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Tareas</h1>
          <Link href="/tasks/new">
            <Button>Nueva Tarea</Button>
          </Link>
        </div>

        <TaskFilters active={filter} onChange={(f) => { setFilter(f); setPage(1) }} />

        {loading ? (
          <GridSkeleton />
        ) : (
          <>
            <TaskGrid
              tasks={tasks}
              isAdmin={true}
              currentUserId={user?.id}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={loadAdminTasks}
            />
          </>
        )}
      </div>
    )
  }

  // ── Collaborator view: 3 sections ─────────────────────────
  const userId = user?.id

  const disponibles = tasks.filter((t) => t.estado === 'pendiente' && !t.asignado_a)
  const misTareas = tasks.filter((t) => t.asignado_a === userId)
  const enProgresoOtros = tasks.filter((t) => t.asignado_a && t.asignado_a !== userId)

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Tareas</h1>
      </div>

      {loading ? (
        <>
          <GridSkeleton count={3} />
          <GridSkeleton count={2} />
        </>
      ) : (
        <>
          <section>
            <SectionHeader
              title="Disponibles"
              count={disponibles.length}
              description="Tareas abiertas que puedes aceptar"
            />
            <TaskGrid
              tasks={disponibles}
              isAdmin={false}
              currentUserId={userId}
              emptyTitle="No hay tareas disponibles"
              emptyDescription="Por el momento no hay tareas disponibles. Revisa más tarde."
            />
          </section>

          <section>
            <SectionHeader
              title="Mis Tareas"
              count={misTareas.length}
              description="Tareas que has aceptado"
            />
            <TaskGrid
              tasks={misTareas}
              isAdmin={false}
              currentUserId={userId}
              emptyTitle="No tienes tareas activas"
              emptyDescription="Acepta una tarea de la sección Disponibles para empezar."
            />
          </section>

          {enProgresoOtros.length > 0 && (
            <section>
              <SectionHeader
                title="En Progreso por Otros"
                count={enProgresoOtros.length}
                description="Tareas que otros colaboradores están trabajando"
              />
              <TaskGrid
                tasks={enProgresoOtros}
                isAdmin={false}
                currentUserId={userId}
                emptyTitle=""
                emptyDescription=""
              />
            </section>
          )}
        </>
      )}
    </div>
  )
}
