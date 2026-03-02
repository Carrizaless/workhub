import { formatRelative } from '@/lib/utils'
import clsx from 'clsx'

export default function ChatMessage({ message, isOwn, onDownload }) {
  const sender = message.remitente
  const displayName = sender?.nombre || sender?.email?.split('@')[0] || 'Usuario'
  const archivos = message.archivos || []
  const hasText = message.contenido && message.contenido.trim()

  return (
    <div className={clsx('flex gap-3', isOwn && 'flex-row-reverse')}>
      <div
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium',
          isOwn
            ? 'bg-accent text-white'
            : 'bg-muted-bg text-muted'
        )}
      >
        {displayName[0]?.toUpperCase()}
      </div>

      <div className={clsx('max-w-[75%]', isOwn && 'text-right')}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-foreground">
            {isOwn ? 'Tu' : displayName}
          </span>
          <span className="text-xs text-muted">
            {formatRelative(message.created_at)}
          </span>
        </div>

        {/* Text bubble */}
        {hasText && (
          <div
            className={clsx(
              'inline-block rounded-2xl px-4 py-2.5 text-sm',
              isOwn
                ? 'bg-accent text-white rounded-tr-md'
                : 'bg-muted-bg text-foreground rounded-tl-md'
            )}
          >
            {message.contenido}
          </div>
        )}

        {/* Attachments */}
        {archivos.length > 0 && (
          <div className={clsx('mt-1.5 space-y-1.5', !hasText && 'mt-0')}>
            {archivos.map((file, i) => (
              <AttachmentCard
                key={i}
                file={file}
                isOwn={isOwn}
                onDownload={onDownload}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AttachmentCard({ file, isOwn, onDownload }) {
  const isImage = file.type?.startsWith('image/')
  const isPdf = file.type === 'application/pdf'

  return (
    <button
      onClick={() => onDownload?.(file)}
      className={clsx(
        'flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors w-full max-w-[260px]',
        isOwn
          ? 'border-accent/40 bg-accent/20 hover:bg-accent/30'
          : 'border-border bg-card hover:bg-muted-bg'
      )}
    >
      <span className={clsx(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
        isPdf ? 'bg-red-50 text-red-600' :
        isImage ? 'bg-green-50 text-green-600' :
        'bg-blue-50 text-blue-600'
      )}>
        {isPdf ? 'PDF' : isImage ? 'IMG' : 'DOC'}
      </span>

      <div className="min-w-0 flex-1">
        <p className={clsx(
          'text-xs font-medium truncate',
          isOwn ? 'text-white' : 'text-foreground'
        )}>
          {file.name}
        </p>
        <p className="text-[10px] text-muted">
          Descargar
        </p>
      </div>

      <svg
        className="h-4 w-4 shrink-0 text-muted"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    </button>
  )
}
