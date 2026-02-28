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
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={clsx(
            'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            active === filter.value
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
