export default function ColaboradoresLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-52 animate-pulse rounded-xl bg-gray-100" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  )
}
