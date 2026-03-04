'use client'

import { useEffect, useRef, useCallback } from 'react'

export default function Modal({ open, onClose, title, children }) {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  // Escape key handler
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }

    // Focus trap
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }, [onClose])

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)

      // Auto-focus the modal
      setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable?.length > 0) focusable[0].focus()
      }, 50)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-xl transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-muted-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
