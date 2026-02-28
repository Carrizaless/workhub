'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '@/lib/supabase/client'
import { updateBinanceId } from '@/actions/users'
import BalanceCard from '@/components/wallet/BalanceCard'
import TransactionTable from '@/components/wallet/TransactionTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function WalletPage() {
  const { user, profile, isAdmin, loading: userLoading } = useUser()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [binanceId, setBinanceId] = useState('')
  const [savingBinance, setSavingBinance] = useState(false)
  const supabase = createClient()

  // Sync input with profile
  useEffect(() => {
    setBinanceId(profile?.binance_id || '')
  }, [profile?.binance_id])

  useEffect(() => {
    async function loadTransactions() {
      if (!user) {
        setLoading(false)
        return
      }

      let query = supabase
        .from('transactions')
        .select('*, tarea:tasks(titulo)')
        .order('created_at', { ascending: false })

      if (!isAdmin) {
        query = query.eq('usuario_id', user.id)
      }

      const { data } = await query
      setTransactions(data || [])
      setLoading(false)
    }

    if (!userLoading) loadTransactions()
  }, [user, userLoading, isAdmin])

  async function handleSaveBinance(e) {
    e.preventDefault()
    setSavingBinance(true)
    const result = await updateBinanceId(binanceId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Datos de pago guardados')
    }
    setSavingBinance(false)
  }

  if (userLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-32 animate-pulse rounded-2xl bg-gray-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        {isAdmin ? 'Billetera General' : 'Mi Billetera'}
      </h1>

      {!isAdmin && <BalanceCard balance={profile?.saldo_actual || 0} />}

      {/* Binance payment info — collaborator only */}
      {!isAdmin && (
        <Card>
          <h2 className="text-sm font-medium text-gray-900 mb-1">
            Datos de Pago
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Ingresa tu Binance ID o correo de Binance para que el administrador
            pueda enviarte tus pagos.
          </p>
          <form onSubmit={handleSaveBinance} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Binance ID o correo
              </label>
              <input
                type="text"
                value={binanceId}
                onChange={(e) => setBinanceId(e.target.value)}
                placeholder="Ej. 123456789 o tu@email.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <Button type="submit" disabled={savingBinance}>
              {savingBinance ? 'Guardando...' : 'Guardar'}
            </Button>
          </form>
          {binanceId && (
            <p className="mt-3 text-xs text-green-600 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              El administrador puede ver tu Binance ID para enviarte los pagos.
            </p>
          )}
        </Card>
      )}

      <Card>
        <h2 className="text-sm font-medium text-gray-900 mb-4">
          Historial de Transacciones
        </h2>
        <TransactionTable transactions={transactions} />
      </Card>
    </div>
  )
}
