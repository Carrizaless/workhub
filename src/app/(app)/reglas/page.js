export const dynamic = 'force-static'

export default function ReglasPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          📜 Reglamento Interno para Colaboradores
        </h1>
        <p className="mt-2 text-base text-muted leading-relaxed">
          Este documento establece las normas de cumplimiento, criterios de evaluación
          y procesos de pago para todos los colaboradores activos en la plataforma.
        </p>
      </div>

      {/* Section 1 */}
      <Section number="1" emoji="⏰" title="Compromiso de Entrega y Plazos">
        <div className="space-y-4">
          <RuleItem title="Cumplimiento de Tiempos">
            El colaborador se compromete a entregar las actividades dentro del
            <strong className="text-foreground"> Tiempo de Espera</strong> estipulado en la plataforma.
          </RuleItem>
          <RuleItem title="Gestión de Retrasos">
            El incumplimiento de los plazos sin previo aviso facultará al Administrador para
            realizar ajustes en el pago <em>(pago parcial)</em> o la anulación de la tarea.
          </RuleItem>
          <RuleItem title="Calidad de Contenido">
            Toda entrega debe alinearse estrictamente con la{' '}
            <strong className="text-foreground">Descripción de la Actividad</strong>.
            El incumplimiento de los requisitos técnicos o creativos resultará en la devolución
            de la tarea para corrección.
          </RuleItem>
        </div>
      </Section>

      {/* Section 2 */}
      <Section number="2" emoji="⭐" title="Cláusula de Recompensas por Desempeño">
        <div className="space-y-4">
          <RuleItem title="Acceso Prioritario">
            Los colaboradores que mantengan un historial recurrente de entregas a tiempo y
            con un mínimo de correcciones <em>(entregas limpias)</em> serán categorizados como{' '}
            <strong className="text-foreground">Colaboradores Premium</strong>.
          </RuleItem>
          <RuleItem title="Mejores Tarifas">
            Este estatus permitirá el acceso exclusivo a proyectos de mayor complejidad y
            trabajos mejor remunerados.
          </RuleItem>
          <RuleItem title="Consistencia">
            La recompensa no es puntual, sino basada en el cumplimiento sostenido de los
            estándares de calidad.
          </RuleItem>
        </div>

        <div className="mt-5 rounded-xl border-l-4 border-stat-amber bg-stat-amber-light p-4">
          <p className="text-sm font-semibold text-stat-amber mb-1">¿Cómo llegar a ser Premium?</p>
          <p className="text-sm text-foreground leading-relaxed">
            Entrega tus tareas a tiempo, con calidad y sin correcciones repetidas.
            El sistema registra tu historial automáticamente.
          </p>
        </div>
      </Section>

      {/* Section 3 */}
      <Section number="3" emoji="💰" title="Gestión Financiera y Billetera">
        <div className="space-y-4">
          <RuleItem title="Transparencia de Saldo">
            Cada colaborador tiene acceso a una sección de{' '}
            <strong className="text-foreground">Billetera</strong> personalizada, donde podrá
            visualizar en tiempo real el monto adeudado por las tareas aprobadas.
          </RuleItem>
          <RuleItem title="Ciclo de Pagos">
            El corte y la liquidación de los montos acumulados se realizarán de forma{' '}
            <strong className="text-foreground">quincenal</strong>.
          </RuleItem>
          <RuleItem title="Aprobación para Pago">
            Solo las tareas marcadas como <strong className="text-foreground">Aprobadas</strong> por
            el Administrador entrarán en el cómputo del pago quincenal inmediato.
            Las tareas en proceso de corrección pasarán al siguiente ciclo.
          </RuleItem>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatBadge emoji="📅" label="Ciclo de pago" value="Quincenal" />
          <StatBadge emoji="✅" label="Tareas contadas" value="Solo Aprobadas" />
          <StatBadge emoji="👁️" label="Saldo" value="En tiempo real" />
        </div>
      </Section>

      {/* Section 4 */}
      <Section number="4" emoji="⚖️" title="Resolución de Discrepancias">
        <div className="space-y-4">
          <RuleItem title="Revisiones">
            En caso de que un pago sea ajustado por el Administrador debido a incumplimientos,
            el colaborador tiene derecho a solicitar una{' '}
            <strong className="text-foreground">justificación detallada</strong> basada en la
            descripción original de la tarea.
          </RuleItem>
          <RuleItem title="Soporte">
            Cualquier incidencia técnica con la billetera o el contador de tiempo debe reportarse
            de inmediato para evitar penalizaciones injustas.
          </RuleItem>
        </div>

        <div className="mt-5 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-accent leading-relaxed">
          Para reportar cualquier incidencia, utiliza el chat de{' '}
          <strong>Soporte</strong> disponible en la sección de Mensajes.
          El equipo responderá a la brevedad posible.
        </div>
      </Section>

      {/* Footer */}
      <div className="rounded-2xl bg-muted-bg border border-border p-6 text-center space-y-2">
        <p className="text-base font-semibold text-foreground">
          ¿Tienes dudas sobre alguna regla?
        </p>
        <p className="text-sm text-muted">
          Comunícate directamente con el administrador a través del chat de soporte
          antes de aceptar una tarea. Es mejor preguntar que cometer un error.
        </p>
      </div>

    </div>
  )
}

function Section({ number, emoji, title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-xl">
          {emoji}
        </div>
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Artículo {number}
          </p>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function RuleItem({ title, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
      <p className="text-base text-muted leading-relaxed">
        {title && <strong className="text-foreground">{title}: </strong>}
        {children}
      </p>
    </div>
  )
}

function StatBadge({ emoji, label, value }) {
  return (
    <div className="rounded-xl bg-muted-bg border border-border p-3 text-center">
      <div className="text-xl mb-1">{emoji}</div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  )
}
