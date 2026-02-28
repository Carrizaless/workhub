export default function UnreadBadge({ count }) {
  if (!count || count <= 0) return null

  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-medium text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}
