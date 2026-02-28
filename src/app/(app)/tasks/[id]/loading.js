export default function TaskDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  )
}
