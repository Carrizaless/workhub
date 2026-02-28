import TaskCard from './TaskCard'
import EmptyState from '@/components/ui/EmptyState'

export default function TaskGrid({
  tasks,
  isAdmin = false,
  currentUserId = null,
  emptyTitle = 'No hay tareas',
  emptyDescription = 'No se encontraron tareas con los filtros seleccionados',
}) {
  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isAdmin={isAdmin}
          isAssignedToMe={!!currentUserId && task.asignado_a === currentUserId}
        />
      ))}
    </div>
  )
}
