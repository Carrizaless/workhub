export default function ReglasPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Lineamientos de Colaboración
        </h1>
        <p className="mt-1 text-sm text-muted">
          Lee con atención antes de comenzar a trabajar en el proyecto.
        </p>
      </div>

      {/* Intro */}
      <div className="rounded-2xl bg-accent/10 border border-accent/20 p-5 text-sm text-accent leading-relaxed">
        A continuación, detallo los lineamientos esenciales que regirán nuestra
        colaboración en este proyecto. Agradezco de antemano su atención y
        disposición. En caso de dudas, comunicarse con el administrador.
      </div>

      {/* Section I */}
      <Section emoji="📚" number="I" title="Alcance del Proyecto: Actividades a Desarrollar">
        <ul className="space-y-2 text-sm text-muted">
          <RuleItem>
            Las actividades a desarrollar son de carácter educativo y buscarán
            impactar positivamente en diversas áreas de conocimiento.
          </RuleItem>
        </ul>
      </Section>

      {/* Section II */}
      <Section emoji="💰" number="II" title="Aspectos Económicos y Retribución">
        <ul className="space-y-2 text-sm text-muted">
          <RuleItem>
            <strong className="text-foreground">Retribución Económica:</strong> Cada actividad contará con
            una retribución económica específica y clara.
          </RuleItem>
          <RuleItem>
            <strong className="text-foreground">Aceptación del Pago:</strong> La retribución se entenderá
            como aceptada en el momento en que el colaborador acepte la
            actividad asignada.
          </RuleItem>
          <RuleItem>
            <strong className="text-foreground">Gestión de Pagos:</strong> Los pagos se efectuarán en el
            periodo establecido por el administrador del proyecto.
          </RuleItem>
        </ul>
      </Section>

      {/* Section III */}
      <Section emoji="📝" number="III" title="Detalles y Proceso de la Actividad">
        <p className="text-sm text-muted mb-3">
          Cada asignación incluirá la siguiente información crítica:
        </p>
        <ul className="space-y-2 text-sm text-muted">
          <RuleItem>Instrucciones detalladas para el desarrollo.</RuleItem>
          <RuleItem>Recursos de apoyo (material, enlaces, etc.).</RuleItem>
          <RuleItem>
            <strong className="text-foreground">Fecha Límite de Entrega</strong> ineludible.
          </RuleItem>
        </ul>
      </Section>

      {/* Section IV */}
      <Section emoji="✅" number="IV" title="Compromiso y Aceptación de Tareas">
        <p className="text-sm text-muted mb-3">
          Para garantizar la calidad y la puntualidad del proyecto, es
          fundamental seguir esta directriz:
        </p>
        <div className="rounded-xl border-l-4 border-amber-400 bg-amber-500/10 p-4 text-sm text-amber-600 leading-relaxed">
          <strong>Priorizar la Aceptación Responsable:</strong> En caso de
          prever dificultades para completar la actividad (por complejidad o por
          el compromiso con la fecha límite), se debe evitar aceptarla
          inicialmente. El compromiso de aceptación implica la garantía de
          entrega.
        </div>
      </Section>

      {/* Footer */}
      <div className="rounded-2xl bg-muted-bg border border-border p-5 text-sm text-muted text-center">
        En caso de no poder cumplir con alguna actividad aceptada, comunícate
        con el administrador a la brevedad posible.
      </div>
    </div>
  )
}

function Section({ emoji, number, title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-muted-bg text-lg">
          {emoji}
        </div>
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            Sección {number}
          </p>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function RuleItem({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted" />
      <span>{children}</span>
    </li>
  )
}
