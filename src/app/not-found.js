import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-semibold text-gray-200">404</h1>
        <p className="mt-4 text-lg text-gray-600">Pagina no encontrada</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
