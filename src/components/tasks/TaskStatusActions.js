'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { acceptTask, transitionTaskState } from '@/actions/tasks'
import { STATE_TRANSITIONS } from '@/lib/constants'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function TaskStatusActions({ task, onSuccess }) {
  const { user, isAdmin } = useUser()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const transition = STATE_TRANSITIONS[task.estado]
  if (!transition || transition.next.length === 0) return null

  // Check if this user can perform the action
  const canAct =
    (transition.role === 'admin' && isAdmin) ||
    (transition.role === 'colaborador' && !isAdmin)

  if (!canAct) return null

  // For pendiente tasks, only show if not assigned
  if (task.estado === 'pendiente' && task.asignado_a) return null

  // For collaborator actions (except accept), must be assigned to this user
  if (
    !isAdmin &&
    task.estado !== 'pendiente' &&
    task.asignado_a !== user?.id
  ) {
    return null
  }

  async function handleAction(newState) {
    setLoading(true)
    try {
      let result
      if (task.estado === 'pendiente' && newState === 'aceptada') {
        result = await acceptTask(task.id)
      } else {
        result = await transitionTaskState(task.id, newState)
      }

      if (result.success === false || result.error) {
        toast.error(result.error || 'Error al actualizar la tarea')
      } else {
        toast.success(result.message || 'Estado actualizado')
        router.refresh()
        onSuccess?.()
      }
    } catch (err) {
      toast.error('Error inesperado')
    }
    setLoading(false)
  }

  // Single action button
  if (transition.next.length === 1) {
    return (
      <Button
        onClick={() => handleAction(transition.next[0])}
        disabled={loading}
        variant={task.estado === 'pendiente' ? 'success' : 'primary'}
      >
        {loading ? 'Procesando...' : transition.label}
      </Button>
    )
  }

  // Multiple actions (en_revision has approve + request correction)
  return (
    <div className="flex gap-2">
      {transition.next.map((state) => (
        <Button
          key={state}
          onClick={() => handleAction(state)}
          disabled={loading}
          variant={state === 'aprobada' ? 'success' : 'secondary'}
        >
          {loading ? '...' : transition.labels[state]}
        </Button>
      ))}
    </div>
  )
}
