'use client'

import { formatDateTime } from '@/lib/utils'

const ESTADO_CONFIG = {
  pendiente:     { label: 'Pendiente',     color: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400' },
  aceptada:      { label: 'Aceptada',      color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  en_revision:   { label: 'En Revisión',   color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  en_correccion: { label: 'En Corrección', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  aprobada:      { label: 'Aprobada',      color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

function StateBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || { label: estado, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default function TaskHistory({ history = [] }) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        Sin historial aún
      </p>
    )
  }

  return (
    <ol className="space-y-0">
      {history.map((entry, i) => {
        const isLast = i === history.length - 1
        const actor = entry.usuario?.nombre || entry.usuario?.email || 'Sistema'

        return (
          <li key={entry.id} className="relative flex gap-3">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[11px] top-6 h-full w-px bg-gray-100" />
            )}

            {/* Dot */}
            <div className="mt-1 flex-shrink-0">
              <div
                className={`h-6 w-6 rounded-full border-2 border-white ring-1 ring-gray-200 flex items-center justify-center ${
                  ESTADO_CONFIG[entry.estado_nuevo]?.dot || 'bg-gray-300'
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Content */}
            <div className="pb-5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                {entry.estado_anterior && (
                  <>
                    <StateBadge estado={entry.estado_anterior} />
                    <svg className="h-3 w-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </>
                )}
                <StateBadge estado={entry.estado_nuevo} />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                <span className="font-medium text-gray-700">{actor}</span>
                {' · '}
                {formatDateTime(entry.created_at)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
