/**
 * Client-side pagination control.
 * Props:
 *   page        – current page (1-based)
 *   totalPages  – total number of pages
 *   onPageChange(page) – callback when user selects a page
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null

  // Build page number array with ellipsis logic
  function getPages() {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    // Always show first, last, current, and neighbours
    const neighbours = new Set([1, totalPages, page, page - 1, page + 1].filter((p) => p >= 1 && p <= totalPages))
    let prev = 0
    for (const p of [...neighbours].sort((a, b) => a - b)) {
      if (prev && p - prev > 1) pages.push('...')
      pages.push(p)
      prev = p
    }
    return pages
  }

  const pages = getPages()

  const btnBase =
    'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors'
  const btnActive = 'bg-gray-900 text-white'
  const btnInactive = 'text-gray-600 hover:bg-gray-100'
  const btnArrow = 'text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed'

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      {/* Previous */}
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={`${btnBase} ${btnArrow}`}
        aria-label="Página anterior"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={`${btnBase} ${btnArrow}`}
        aria-label="Página siguiente"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}
