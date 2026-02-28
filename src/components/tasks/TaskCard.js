import Link from 'next/link'
import Card from '@/components/ui/Card'
import TaskStatusBadge from './TaskStatusBadge'
import { formatCurrency, formatDate, getDeadlineStatus } from '@/lib/utils'

/**
 * @param {{ task, isAdmin, isAssignedToMe }} props
 * isAdmin / isAssignedToMe control which state label is shown on the badge.
 * task.asignado should be { nombre, email } if joined in the query.
 */
export default function TaskCard({ task, isAdmin = false, isAssignedToMe = false }) {
  const deadlineStatus = task.estado !== 'aprobada' ? getDeadlineStatus(task.fecha_limite) : 'normal'
  const assigneeName = task.asignado?.nombre || task.asignado?.email || null

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <TaskStatusBadge
            estado={task.estado}
            isAdmin={isAdmin}
            isAssignedToMe={isAssignedToMe}
          />
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(task.precio)}
          </span>
        </div>

        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
          {task.titulo}
        </h3>

        {task.descripcion && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {task.descripcion}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          {task.fecha_limite ? (
            <span
              className={`text-xs ${
                deadlineStatus === 'vencida' ? 'text-red-500 font-medium' :
                deadlineStatus === 'urgente' ? 'text-red-400 font-medium' :
                deadlineStatus === 'proxima' ? 'text-yellow-600 font-medium' :
                'text-gray-400'
              }`}
            >
              {deadlineStatus === 'vencida' ? 'Vencida: ' :
               deadlineStatus === 'urgente' ? 'Vence hoy: ' :
               deadlineStatus === 'proxima' ? 'Pronto: ' : 'Límite: '}
              {formatDate(task.fecha_limite)}
            </span>
          ) : (
            <span className="text-xs text-gray-400">Sin fecha límite</span>
          )}

          {/* Show assignee name on "others" section */}
          {assigneeName && !isAssignedToMe && !isAdmin ? (
            <span className="text-xs text-indigo-500 font-medium truncate max-w-[110px]">
              {assigneeName}
            </span>
          ) : (
            task.archivos_adjuntos?.length > 0 && (
              <span className="text-xs text-gray-400">
                {task.archivos_adjuntos.length} archivo
                {task.archivos_adjuntos.length !== 1 ? 's' : ''}
              </span>
            )
          )}
        </div>
      </Card>
    </Link>
  )
}
