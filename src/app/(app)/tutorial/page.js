'use client'

import { useState } from 'react'

const steps = [
  {
    number: 1,
    title: 'Crear Tarea',
    role: 'Admin',
    description:
      'El administrador crea una nueva tarea desde el panel de tareas. Define el título, descripción, categoría, fecha límite y el monto de pago.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Asignar Colaborador',
    role: 'Admin',
    description:
      'El administrador selecciona un colaborador de la lista y le asigna la tarea. El colaborador recibe una notificación inmediata.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Aceptar Tarea',
    role: 'Colaborador',
    description:
      'El colaborador revisa los detalles de la tarea y la acepta. A partir de este momento, puede comenzar a trabajar en ella.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Entregar Trabajo',
    role: 'Colaborador',
    description:
      'El colaborador completa la tarea y sube los archivos requeridos. Puede comunicarse con el admin vía chat durante el proceso.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    number: 5,
    title: 'Revisar y Aprobar',
    role: 'Admin',
    description:
      'El administrador revisa la entrega. Puede aprobarla, solicitar correcciones o rechazarla con comentarios.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    number: 6,
    title: 'Pago Procesado',
    role: 'Sistema',
    description:
      'Una vez aprobada la tarea, el pago se acredita automáticamente en la billetera del colaborador. Listo para retirar.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
]

const roleColor = {
  Admin: 'bg-accent text-white',
  Colaborador: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  Sistema: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
}

export default function TutorialPage() {
  const [active, setActive] = useState(0)

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
          <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          Flujo de Trabajo
        </h1>
        <p className="mt-2 text-sm text-muted max-w-lg mx-auto">
          Aprende cómo funciona el ciclo completo de una tarea en WorkHub, desde la creación hasta el pago.
        </p>
      </div>

      {/* Steps Navigation */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors">
        {/* Progress bar */}
        <div className="relative mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="group relative z-10 flex flex-col items-center"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    i <= active
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-card text-muted'
                  } ${i === active ? 'ring-4 ring-accent/20 scale-110' : ''}`}
                >
                  <span className="text-sm font-bold">{step.number}</span>
                </div>
                <span
                  className={`mt-2 text-[10px] font-medium hidden sm:block ${
                    i === active ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {step.title}
                </span>
              </button>
            ))}
          </div>
          {/* Connector line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-border -translate-y-1/2" />
          <div
            className="absolute top-5 left-5 h-0.5 bg-accent -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(active / (steps.length - 1)) * 100}%`, maxWidth: 'calc(100% - 2.5rem)' }}
          />
        </div>

        {/* Active Step Detail */}
        <div className="flex flex-col sm:flex-row items-start gap-5 rounded-xl bg-muted-bg/50 p-5 transition-all">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            {steps[active].icon}
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-foreground">
                {steps[active].title}
              </h3>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${roleColor[steps[active].role]}`}>
                {steps[active].role}
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              {steps[active].description}
            </p>
          </div>
        </div>

        {/* Prev / Next */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setActive(Math.max(0, active - 1))}
            disabled={active === 0}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-muted-bg disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Anterior
          </button>
          <button
            onClick={() => setActive(Math.min(steps.length - 1, active + 1))}
            disabled={active === steps.length - 1}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Siguiente
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Resumen Rápido
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            }
            title="Admin"
            items={['Crea tareas', 'Asigna colaboradores', 'Revisa entregas', 'Aprueba pagos']}
          />
          <SummaryCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            }
            title="Colaborador"
            items={['Acepta tareas', 'Trabaja y entrega', 'Recibe pagos', 'Consulta vía chat']}
          />
          <SummaryCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            }
            title="Comunicación"
            items={['Chat por tarea', 'Soporte directo', 'Notificaciones', 'Adjuntar archivos']}
          />
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ icon, title, items }) {
  return (
    <div className="rounded-xl border border-border bg-muted-bg/30 p-4 space-y-3 transition-colors">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
          {icon}
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-muted">
            <div className="h-1.5 w-1.5 rounded-full bg-accent/50 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
