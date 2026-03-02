import LoginForm from '@/components/auth/LoginForm'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Ingresar - WorkHub',
}

export default async function LoginPage() {
  // Diagnostic: check what's available server-side
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookies = allCookies.filter((c) => c.name.includes('auth') || c.name.includes('supabase'))

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">WorkHub</h1>
        <p className="mt-2 text-sm text-gray-500">
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <LoginForm />
      </div>

      {/* Temporary diagnostic — remove after debugging */}
      <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-3 text-[10px] font-mono text-gray-400 space-y-1">
        <p>ENV: URL {hasUrl ? '✓' : '✗'} | KEY {hasKey ? '✓' : '✗'}</p>
        <p>Auth cookies: {authCookies.length > 0 ? authCookies.map((c) => c.name).join(', ') : 'ninguna'}</p>
        <p>Total cookies: {allCookies.length}</p>
      </div>
    </div>
  )
}
