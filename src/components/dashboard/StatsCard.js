import Card from '@/components/ui/Card'

export default function StatsCard({ title, value, subtitle, icon }) {
  return (
    <Card className="flex items-start gap-4">
      {icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted-bg text-muted">
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
