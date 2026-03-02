import LoginForm from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Ingresar - WorkHub',
}

export default function LoginPage() {
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
    </div>
  )
}
