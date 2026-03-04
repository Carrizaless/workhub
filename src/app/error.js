'use client'

export default function GlobalError({ error, reset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 mb-4">
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Algo salió mal</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        {error?.message || 'Ocurrió un error inesperado.'}
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
