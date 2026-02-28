'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '@/lib/supabase/client'
import ChatPanel from '@/components/chat/ChatPanel'
import Card from '@/components/ui/Card'
import clsx from 'clsx'

export default function ChatPage() {
  const { user, isAdmin, loading } = useUser()
  const [collaborators, setCollaborators] = useState([])
  const [selectedCollab, setSelectedCollab] = useState(null)
  const [adminId, setAdminId] = useState(null)
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    if (loading || !user) return

    const supabase = createClient()

    async function loadUsers() {
      if (isAdmin) {
        const { data } = await supabase
          .from('users')
          .select('id, nombre, email, avatar_url')
          .eq('role', 'colaborador')
          .order('nombre', { ascending: true })

        setCollaborators(data || [])
        if (data?.length > 0) setSelectedCollab(data[0])
      } else {
        const { data } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .single()

        if (data) setAdminId(data.id)
      }
      setLoadingUsers(false)
    }

    loadUsers()
  }, [user, isAdmin, loading])

  if (loading || loadingUsers) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    )
  }

  // --- Collaborator view: single conversation with admin ---
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mensajes</h1>
          <p className="mt-1 text-sm text-gray-500">Conversación con el administrador</p>
        </div>
        <Card>
          {adminId ? (
            <ChatPanel isSoporte otherUserId={adminId} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No se encontró el administrador.</p>
          )}
        </Card>
      </div>
    )
  }

  // --- Admin view: inbox with collaborator list ---
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mensajes</h1>
        <p className="mt-1 text-sm text-gray-500">Conversaciones directas con colaboradores</p>
      </div>

      <div className="flex gap-4 h-[600px]">
        {/* Collaborator list */}
        <div className="w-64 flex-shrink-0 rounded-2xl border border-gray-200 bg-white overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Colaboradores</p>
          </div>

          {collaborators.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8 px-3">
              No hay colaboradores registrados.
            </p>
          ) : (
            <ul className="p-2 space-y-1">
              {collaborators.map((collab) => {
                const initials = (collab.nombre?.[0] || collab.email?.[0] || '?').toUpperCase()
                const isSelected = selectedCollab?.id === collab.id

                return (
                  <li key={collab.id}>
                    <button
                      onClick={() => setSelectedCollab(collab)}
                      className={clsx(
                        'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      {collab.avatar_url ? (
                        <img
                          src={collab.avatar_url}
                          alt={collab.nombre || collab.email}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {collab.nombre || collab.email}
                        </p>
                        {collab.nombre && (
                          <p className="text-xs text-gray-400 truncate">{collab.email}</p>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col">
          {selectedCollab ? (
            <>
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
                {selectedCollab.avatar_url ? (
                  <img
                    src={selectedCollab.avatar_url}
                    alt={selectedCollab.nombre || selectedCollab.email}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                    {(selectedCollab.nombre?.[0] || selectedCollab.email?.[0] || '?').toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedCollab.nombre || selectedCollab.email}
                  </p>
                  {selectedCollab.nombre && (
                    <p className="text-xs text-gray-400">{selectedCollab.email}</p>
                  )}
                </div>
              </div>
              <div className="flex-1 p-4 overflow-hidden">
                <ChatPanel
                  key={selectedCollab.id}
                  isSoporte
                  otherUserId={selectedCollab.id}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-gray-400">
                Selecciona un colaborador para ver la conversación.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
