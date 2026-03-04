'use client'

import { STATE_LABELS } from '@/lib/constants'
import clsx from 'clsx'

const filters = [
  { value: 'all', label: 'Todas' },
  ...Object.entries(STATE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

export default function TaskFilters({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar tareas por estado">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          role="tab"
          aria-selected={active === filter.value}
          className={clsx(
            'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            active === filter.value
              ? 'bg-accent text-white shadow-sm shadow-accent/25'
              : 'bg-muted-bg text-muted hover:bg-border hover:text-foreground'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
