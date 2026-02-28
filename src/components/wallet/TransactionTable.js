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
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
              Fecha
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
              Descripcion
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
              Tipo
            </th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
              Monto
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                {formatDateTime(tx.created_at)}
              </td>
              <td className="py-3 px-4 text-gray-900">
                {tx.descripcion || tx.tarea?.titulo || '-'}
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
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
