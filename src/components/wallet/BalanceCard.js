import Card from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

export default function BalanceCard({ balance = 0 }) {
  return (
    <Card className="bg-gradient-to-br from-accent to-info border-0 shadow-lg shadow-accent/20">
      <p className="text-sm text-white/70">Saldo Disponible</p>
      <p className="mt-2 text-3xl font-bold text-white">
        {formatCurrency(balance)}
      </p>
      <p className="mt-1 text-xs text-white/50">
        El saldo se acumula al aprobar tareas
      </p>
    </Card>
  )
}
