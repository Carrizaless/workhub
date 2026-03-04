import Card from '@/components/ui/Card'
import clsx from 'clsx'

const colorMap = {
  blue:    { icon: 'bg-stat-blue-light text-stat-blue',     border: 'border-l-stat-blue' },
  amber:   { icon: 'bg-stat-amber-light text-stat-amber',   border: 'border-l-stat-amber' },
  emerald: { icon: 'bg-stat-emerald-light text-stat-emerald', border: 'border-l-stat-emerald' },
  violet:  { icon: 'bg-stat-violet-light text-stat-violet',   border: 'border-l-stat-violet' },
}

export default function StatsCard({ title, value, subtitle, icon, color = 'blue' }) {
  const scheme = colorMap[color] || colorMap.blue

  return (
    <Card className={clsx('flex items-start gap-4 border-l-4', scheme.border)}>
      {icon && (
        <div className={clsx(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          scheme.icon
        )}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-muted">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        )}
      </div>
    </Card>
  )
}
