import { formatRelative } from '@/lib/utils'
import clsx from 'clsx'

export default function ChatMessage({ message, isOwn }) {
  const sender = message.remitente
  const displayName = sender?.nombre || sender?.email?.split('@')[0] || 'Usuario'

  return (
    <div className={clsx('flex gap-3', isOwn && 'flex-row-reverse')}>
      <div
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium',
          isOwn
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-600'
        )}
      >
        {displayName[0]?.toUpperCase()}
      </div>

      <div className={clsx('max-w-[75%]', isOwn && 'text-right')}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-700">
            {isOwn ? 'Tu' : displayName}
          </span>
          <span className="text-xs text-gray-400">
            {formatRelative(message.created_at)}
          </span>
        </div>
        <div
          className={clsx(
            'inline-block rounded-2xl px-4 py-2.5 text-sm',
            isOwn
              ? 'bg-gray-900 text-white rounded-tr-md'
              : 'bg-gray-100 text-gray-900 rounded-tl-md'
          )}
        >
          {message.contenido}
        </div>
      </div>
    </div>
  )
}
