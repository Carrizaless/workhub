'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useUnreadDMs } from '@/hooks/useUnreadCount'
import LogoutButton from '@/components/auth/LogoutButton'
import clsx from 'clsx'

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tasks', label: 'Tareas' },
  { href: '/colaboradores', label: 'Colaboradores' },
  { href: '/chat', label: 'Mensajes' },
  { href: '/wallet', label: 'Billetera' },
  { href: '/blog', label: 'Blog' },
  { href: '/reglas', label: 'Reglas' },
  { href: '/settings', label: 'Configuracion' },
]

const collaboratorLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tasks', label: 'Tareas' },
  { href: '/chat', label: 'Mensajes' },
  { href: '/wallet', label: 'Mi Billetera' },
  { href: '/blog', label: 'Blog' },
  { href: '/reglas', label: 'Reglas' },
  { href: '/settings', label: 'Configuracion' },
]

export default function MobileNav({ open, onClose }) {
  const pathname = usePathname()
  const { user, profile, isAdmin } = useUser()
  const links = isAdmin ? adminLinks : collaboratorLinks
  const dmCount = useUnreadDMs(user?.id)
  const initials = (profile?.nombre?.[0] || profile?.email?.[0] || '?').toUpperCase()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
          <span className="text-xl font-semibold text-gray-900">WorkHub</span>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/dashboard' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {link.label}
                {link.href === '/chat' && dmCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {dmCount > 9 ? '9+' : dmCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-9 w-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.nombre || profile?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
