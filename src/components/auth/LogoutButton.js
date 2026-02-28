'use client'

import { logout } from '@/actions/auth'

export default function LogoutButton({ className = '' }) {
  return (
    <button
      onClick={() => logout()}
      className={`text-sm text-gray-500 hover:text-gray-900 transition-colors ${className}`}
    >
      Cerrar sesion
    </button>
  )
}
