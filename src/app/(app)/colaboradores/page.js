'use client'

import { useEffect, useState } from 'react'
import { getCollaboratorsWithBinance, createCollaborator, deleteCollaborator } from '@/actions/users'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ColaboradoresPage() {
  const { isAdmin, loading: userLoading } = useUser()
  const router = useRouter()
  const [colaboradores, setColaboradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  // Delete confirmation: stores the collaborator object being deleted, or null
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.replace('/dashboard')
    }
  }, [isAdmin, userLoading, router])

  async function reload() {
    const updated = await getCollaboratorsWithBinance()
    if (!updated.error) setColaboradores(updated.data)
  }

  useEffect(() => {
    async function load() {
      const result = await getCollaboratorsWithBinance()
      if (result.error) {
        toast.error(result.error)
      } else {
        setColaboradores(result.data)
      }
      setLoading(false)
    }
    if (!userLoading && isAdmin) load()
  }, [userLoading, isAdmin])

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.target)
    const result = await createCollaborator(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Colaborador creado exitosamente')
      setShowModal(false)
      e.target.reset()
      await reload()
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirmDeleteId) return
    setDeleting(true)
    const result = await deleteCollaborator(confirmDeleteId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Colaborador eliminado')
      setConfirmDeleteId(null)
      await reload()
    }
    setDeleting(false)
  }

  const confirmTarget = colaboradores.find((c) => c.id === confirmDeleteId)

  if (loading || userLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-52 animate-pulse rounded-xl bg-gray-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Colaboradores</h1>
          <p className="mt-1 text-sm text-gray-500">
            {colaboradores.length}{' '}
            {colaboradores.length === 1 ? 'colaborador activo' : 'colaboradores activos'}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar colaborador
        </Button>
      </div>

      {/* Collaborator cards */}
      {colaboradores.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Sin colaboradores aún</p>
            <p className="mt-1 text-sm text-gray-500">Agrega el primer colaborador para empezar a asignar tareas.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Agregar colaborador →
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colaboradores.map((c) => {
            const tasks = c.tasks || []
            const activas = tasks.filter((t) => t.estado !== 'aprobada').length
            const completadas = tasks.filter((t) => t.estado === 'aprobada').length
            const totalGanado = tasks
              .filter((t) => t.estado === 'aprobada')
              .reduce((sum, t) => sum + (t.precio || 0), 0)
            const ratedTasks = tasks.filter((t) => t.estado === 'aprobada' && t.calificacion)
            const avgRating = ratedTasks.length > 0
              ? ratedTasks.reduce((sum, t) => sum + t.calificacion, 0) / ratedTasks.length
              : null

            return (
              <Card key={c.id} className="flex flex-col gap-4">
                {/* Avatar + info + delete button */}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-semibold text-white">
                    {(c.nombre || c.email)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {c.nombre || '—'}
                    </p>
                    <p className="truncate text-xs text-gray-500">{c.email}</p>
                  </div>
                  {/* Delete icon button */}
                  <button
                    onClick={() => setConfirmDeleteId(c.id)}
                    className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Eliminar colaborador"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{activas}</p>
                    <p className="text-xs text-gray-500">Activas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{completadas}</p>
                    <p className="text-xs text-gray-500">Hechas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(totalGanado)}
                    </p>
                    <p className="text-xs text-gray-500">Ganado</p>
                  </div>
                </div>

                {/* Rating */}
                {avgRating !== null && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className={`h-3.5 w-3.5 ${s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {avgRating.toFixed(1)} ({ratedTasks.length} {ratedTasks.length === 1 ? 'calificación' : 'calificaciones'})
                    </span>
                  </div>
                )}

                {/* Saldo + fecha */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-xs text-gray-500">Saldo actual</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(c.saldo_actual || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Miembro desde</p>
                    <p className="text-xs text-gray-700">{formatDate(c.created_at)}</p>
                  </div>
                </div>

                {/* Binance payment info */}
                {c.binance_id ? (
                  <div className="flex items-center gap-2 rounded-xl bg-yellow-50 border border-yellow-100 px-3 py-2">
                    <svg className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-xs text-yellow-600 font-medium">Binance ID</p>
                      <p className="text-xs text-gray-700 truncate">{c.binance_id}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center">Sin datos de pago</p>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Collaborator Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Agregar colaborador"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nombre completo"
            name="nombre"
            placeholder="Ej. María García"
          />
          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            required
            placeholder="colaborador@email.com"
          />
          <Input
            label="Contraseña inicial"
            name="password"
            type="password"
            required
            placeholder="Mínimo 6 caracteres"
          />
          <p className="text-xs text-gray-500">
            El colaborador podrá cambiar su contraseña desde Configuración una vez que inicie sesión.
          </p>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creando...' : 'Crear colaborador'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Collaborator Confirmation Modal */}
      <Modal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Eliminar colaborador"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar a{' '}
            <span className="font-semibold text-gray-900">
              {confirmTarget?.nombre || confirmTarget?.email}
            </span>
            ?
          </p>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 space-y-1">
            <p className="font-medium">Esto hará lo siguiente:</p>
            <ul className="list-disc list-inside space-y-0.5 mt-1">
              <li>Sus tareas activas volverán a estar disponibles.</li>
              <li>Su cuenta será eliminada permanentemente.</li>
              <li>Esta acción no se puede deshacer.</li>
            </ul>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              disabled={deleting}
              className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
