import LoginForm from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Ingresar - WorkHub',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white text-xl font-bold shadow-lg shadow-accent/25">
          W
        </div>
        <h1 className="text-2xl font-bold text-foreground">WorkHub</h1>
        <p className="mt-2 text-sm text-muted">
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      <div className="rounded-2xl bg-card p-8 shadow-lg shadow-black/5 border border-border transition-colors">
        <LoginForm />
      </div>
    </div>
  )
}
