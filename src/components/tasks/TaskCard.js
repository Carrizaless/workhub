import Link from 'next/link'
import Card from '@/components/ui/Card'
import TaskStatusBadge from './TaskStatusBadge'
import { formatCurrency, formatDate, getDeadlineStatus } from '@/lib/utils'

function DeadlineIcon({ status }) {
  if (status === 'vencida' || status === 'urgente') {
    return (
      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    )
  }
  if (status === 'proxima') {
    return (
      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
  return null
}

/**
 * @param {{ task, isAdmin, isAssignedToMe }} props
 * isAdmin / isAssignedToMe control which state label is shown on the badge.
 * task.asignado should be { nombre, email } if joined in the query.
 */
export default function TaskCard({ task, isAdmin = false, isAssignedToMe = false }) {
  const deadlineStatus = task.estado !== 'aprobada' ? getDeadlineStatus(task.fecha_limite) : 'normal'
  const assigneeName = task.asignado?.nombre || task.asignado?.email || null

  return (
    <Link href={`/tasks/${task.id}`} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl">
      <Card hover className="cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <TaskStatusBadge
            estado={task.estado}
            isAdmin={isAdmin}
            isAssignedToMe={isAssignedToMe}
          />
          <span className="text-sm font-semibold text-success">
            {formatCurrency(task.precio)}
          </span>
        </div>

        <h3 className="text-sm font-medium text-foreground mb-1 line-clamp-2">
          {task.titulo}
        </h3>

        {task.descripcion && (
          <p className="text-xs text-muted line-clamp-2 mb-3">
            {task.descripcion}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          {task.fecha_limite ? (
            <span
              className={`flex items-center gap-1 text-xs ${
                deadlineStatus === 'vencida' ? 'text-danger font-medium' :
                deadlineStatus === 'urgente' ? 'text-danger font-medium' :
                deadlineStatus === 'proxima' ? 'text-warning font-medium' :
                'text-muted'
              }`}
            >
              <DeadlineIcon status={deadlineStatus} />
              {deadlineStatus === 'vencida' ? 'Vencida: ' :
               deadlineStatus === 'urgente' ? 'Vence hoy: ' :
               deadlineStatus === 'proxima' ? 'Pronto: ' : 'Límite: '}
              {formatDate(task.fecha_limite)}
            </span>
          ) : (
            <span className="text-xs text-muted">Sin fecha límite</span>
          )}

          {/* Show assignee name on "others" section */}
          {assigneeName && !isAssignedToMe && !isAdmin ? (
            <span className="text-xs text-info font-medium truncate max-w-[110px]">
              {assigneeName}
            </span>
          ) : (
            task.archivos_adjuntos?.length > 0 && (
              <span className="text-xs text-muted">
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
