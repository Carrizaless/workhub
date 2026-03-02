'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function InvitarPage() {
  const [copied, setCopied] = useState(false)
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/login`
    : '/login'

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true)
      toast.success('Enlace copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
          <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          Invitar Colaboradores
        </h1>
        <p className="mt-2 text-sm text-muted max-w-md mx-auto">
          Comparte el enlace de acceso para que nuevos colaboradores se unan a la plataforma.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          ¿Cómo funciona?
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Step number={1} icon="🔗" title="Comparte el enlace">
            Envía el enlace de invitación a la persona que deseas invitar.
          </Step>
          <Step number={2} icon="📝" title="Registro">
            El colaborador se registra con su email y contraseña en la plataforma.
          </Step>
          <Step number={3} icon="✅" title="Listo para trabajar">
            Una vez registrado, aparecerá en tu lista de colaboradores y podrá recibir tareas.
          </Step>
        </div>
      </div>

      {/* Invite Link */}
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 space-y-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Enlace de Invitación</p>
            <p className="text-xs text-muted">Comparte este enlace con tus futuros colaboradores</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted font-mono truncate transition-colors">
            {inviteUrl}
          </div>
          <button
            onClick={handleCopy}
            className="flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-white hover:opacity-90 transition-all shrink-0"
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Copiado
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                Copiar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Beneficios para colaboradores
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Benefit icon="💰" title="Ganancias por tarea" text="Recibe pago por cada tarea completada y aprobada." />
          <Benefit icon="📊" title="Dashboard personal" text="Monitorea tu progreso, calificaciones y ganancias." />
          <Benefit icon="💬" title="Comunicación directa" text="Chat integrado para resolver dudas al instante." />
          <Benefit icon="📁" title="Gestión de archivos" text="Sube y descarga documentos de forma segura." />
        </div>
      </div>
    </div>
  )
}

function Step({ number, icon, title, children }) {
  return (
    <div className="text-center space-y-2">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted-bg text-xl">
        {icon}
      </div>
      <div>
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white mb-1">
          {number}
        </span>
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <p className="text-xs text-muted leading-relaxed">{children}</p>
    </div>
  )
}

function Benefit({ icon, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted-bg/50 p-3 transition-colors">
      <span className="text-lg shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted mt-0.5">{text}</p>
      </div>
    </div>
  )
}
