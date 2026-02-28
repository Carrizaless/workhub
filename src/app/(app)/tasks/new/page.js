import TaskForm from '@/components/tasks/TaskForm'
import Card from '@/components/ui/Card'

export default function NewTaskPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Nueva Tarea
      </h1>
      <Card>
        <TaskForm />
      </Card>
    </div>
  )
}
