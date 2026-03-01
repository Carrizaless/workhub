'use client'

import { useState } from 'react'

/**
 * Star rating component.
 * @param {{ value: number|null, onChange: (rating: number) => void, readOnly: boolean }} props
 */
export default function TaskRating({ value = null, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(null)

  const displayed = hovered ?? value ?? 0

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(null)}
          className={`transition-colors focus:outline-none ${
            readOnly ? 'cursor-default' : 'cursor-pointer'
          }`}
          aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
        >
          <svg
            className={`h-5 w-5 transition-colors ${
              star <= displayed
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
      {value !== null && value !== undefined && (
        <span className="ml-1.5 text-xs text-gray-500">{value}/5</span>
      )}
    </div>
  )
}
