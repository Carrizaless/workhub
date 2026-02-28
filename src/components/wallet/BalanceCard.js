import Card from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

export default function BalanceCard({ balance = 0 }) {
  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0">
      <p className="text-sm text-gray-400">Saldo Disponible</p>
      <p className="mt-2 text-3xl font-semibold text-white">
        {formatCurrency(balance)}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        El saldo se acumula al aprobar tareas
      </p>
    </Card>
  )
}
