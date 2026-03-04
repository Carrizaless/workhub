'use client'

export default function AppError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-light mb-4">
        <svg className="h-8 w-8 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Algo salió mal</h2>
      <p className="text-sm text-muted mb-6 max-w-md">
        {error?.message || 'Ocurrió un error inesperado. Por favor intenta de nuevo.'}
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors active:scale-[0.98]"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
