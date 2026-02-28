'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge'
import TaskStatusActions from '@/components/tasks/TaskStatusActions'
import FileUploader from '@/components/files/FileUploader'
import FileList from '@/components/files/FileList'
import ChatPanel from '@/components/chat/ChatPanel'
import TaskHistory from '@/components/tasks/TaskHistory'
import TaskRating from '@/components/tasks/TaskRating'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { deleteTask, rateTask } from '@/actions/tasks'
import toast from 'react-hot-toast'

export default function TaskDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, isAdmin, loading: userLoading } = useUser()
  const [task, setTask] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  const isAssignedToMe = !!user?.id && task?.asignado_a === user.id

  const loadTask = useCallback(async () => {
    setLoading(true)

    const taskRes = await supabase
      .from('tasks')
      .select('*, asignado:users!asignado_a(id, email, nombre)')
      .eq('id', id)
      .single()

    // task_history may not exist yet — fail silently
    let historyData = []
    try {
      const historyRes = await supabase
        .from('task_history')
        .select('*, usuario:users!user_id(nombre, email)')
        .eq('task_id', id)
        .order('created_at', { ascending: true })
      historyData = historyRes.data || []
    } catch {
      historyData = []
    }

    setTask(taskRes.data)
    setHistory(historyData)
    setLoading(false)
  }, [id, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (id) loadTask()
  }, [id, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleFilesUpdate(newFiles) {
    setTask((prev) => ({ ...prev, archivos_adjuntos: newFiles }))
  }

  async function handleRate(rating) {
    const result = await rateTask(id, rating)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setTask((prev) => ({ ...prev, calificacion: rating }))
      toast.success('Calificación guardada')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteTask(id)
    if (result?.error) {
      toast.error(result.error)
      setDeleting(false)
    } else {
      toast.success('Tarea eliminada')
      router.push('/tasks')
    }
  }

  if (loading || userLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Tarea no encontrada</p>
      </div>
    )
  }

  const canUpload =
    isAdmin ||
    (isAssignedToMe && ['aceptada', 'en_correccion'].includes(task.estado))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TaskStatusBadge
              estado={task.estado}
              isAdmin={isAdmin}
              isAssignedToMe={isAssignedToMe}
            />
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(task.precio)}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {task.titulo}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <TaskStatusActions
            task={task}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />

          {/* Admin delete button */}
          {isAdmin && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation banner */}
      {confirmDelete && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-red-800">¿Eliminar esta tarea?</p>
            <p className="text-xs text-red-600 mt-0.5">Esta acción no se puede deshacer. Se eliminará todo el historial y archivos.</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <h2 className="text-sm font-medium text-gray-900 mb-3">
              Descripción
            </h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {task.descripcion || 'Sin descripción'}
            </p>
          </Card>

          {/* Files */}
          <Card>
            <h2 className="text-sm font-medium text-gray-900 mb-3">
              Archivos Adjuntos
            </h2>
            <FileList
              taskId={task.id}
              files={task.archivos_adjuntos || []}
              canDelete={isAdmin}
              onUpdate={handleFilesUpdate}
            />
            {canUpload && (
              <div className="mt-4">
                <FileUploader
                  taskId={task.id}
                  existingFiles={task.archivos_adjuntos || []}
                  onUpload={handleFilesUpdate}
                />
              </div>
            )}
          </Card>

          {/* Chat (only if task is assigned) */}
          {task.asignado_a && (
            <Card>
              <h2 className="text-sm font-medium text-gray-900 mb-3">
                Chat de la Tarea
              </h2>
              <ChatPanel taskId={task.id} />
            </Card>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {/* History / Audit log */}
          <Card>
            <h2 className="text-sm font-medium text-gray-900 mb-4">
              Historial
            </h2>
            <TaskHistory history={history} />
          </Card>

          <Card>
            <h2 className="text-sm font-medium text-gray-900 mb-4">
              Detalles
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500">Estado</dt>
                <dd className="mt-0.5">
                  <TaskStatusBadge
                    estado={task.estado}
                    isAdmin={isAdmin}
                    isAssignedToMe={isAssignedToMe}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Precio</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatCurrency(task.precio)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Asignado a</dt>
                <dd className="text-sm text-gray-900">
                  {task.asignado
                    ? task.asignado.nombre || task.asignado.email
                    : 'Sin asignar'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Fecha Límite</dt>
                <dd className="text-sm text-gray-900">
                  {task.fecha_limite
                    ? formatDate(task.fecha_limite)
                    : 'Sin fecha límite'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Creada</dt>
                <dd className="text-sm text-gray-900">
                  {formatDateTime(task.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Última actualización</dt>
                <dd className="text-sm text-gray-900">
                  {formatDateTime(task.updated_at)}
                </dd>
              </div>
              {task.estado === 'aprobada' && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1.5">
                    {isAdmin ? 'Calificación' : 'Tu calificación'}
                  </dt>
                  <dd>
                    <TaskRating
                      value={task.calificacion}
                      onChange={handleRate}
                      readOnly={!isAdmin}
                    />
                    {!task.calificacion && isAdmin && (
                      <p className="mt-1 text-xs text-gray-400">Haz clic en las estrellas para calificar</p>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}
