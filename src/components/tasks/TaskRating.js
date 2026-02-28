'use client'

import { useState } from 'react'

/**
 * Star rating component for approved tasks.
 * @param {{ value, onChange, readOnly }} props
 * - value: current rating (1-5 or null)
 * - onChange: callback(rating) — only called when readOnly=false
 * - readOnly: if true, just displays stars without interaction
 */
export default function TaskRating({ value = null, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0)

  const display = hovered || value || 0

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-colors ${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
          }`}
          aria-label={`${star} estrellas`}
        >
          <svg
            className={`h-5 w-5 transition-colors ${
              star <= display
                ? 'text-yellow-400'
                : 'text-gray-200'
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
      {value && (
        <span className="ml-1 text-xs text-gray-400">{value}/5</span>
      )}
    </div>
  )
}
