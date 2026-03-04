import { formatCurrency, formatDateTime } from '@/lib/utils'
import EmptyState from '@/components/ui/EmptyState'

const typeLabels = {
  pago_tarea: 'Pago por tarea',
  ajuste_manual: 'Ajuste manual',
  retiro: 'Retiro',
}

export default function TransactionTable({ transactions = [] }) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="Sin transacciones"
        description="Las transacciones apareceran aqui cuando se aprueben tareas"
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
              Fecha
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
              Descripcion
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
              Tipo
            </th>
            <th className="text-right py-3 px-4 text-xs font-medium text-muted uppercase">
              Monto
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-muted-bg transition-colors">
              <td className="py-3 px-4 text-muted whitespace-nowrap">
                {formatDateTime(tx.created_at)}
              </td>
              <td className="py-3 px-4 text-foreground">
                {tx.descripcion || tx.tarea?.titulo || '-'}
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex rounded-lg bg-muted-bg px-2 py-0.5 text-xs text-muted">
                  {typeLabels[tx.tipo] || tx.tipo}
                </span>
              </td>
              <td className="py-3 px-4 text-right font-medium text-green-600 whitespace-nowrap">
                +{formatCurrency(tx.monto)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
