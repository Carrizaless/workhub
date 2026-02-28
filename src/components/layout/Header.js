'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import MobileNav from './MobileNav'
import NotificationBell from './NotificationBell'

export default function Header() {
  const { profile, user } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 lg:px-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="lg:hidden text-lg font-semibold text-gray-900">WorkHub</div>

        <div className="flex items-center gap-2">
          {/* Notification bell */}
          {user?.id && <NotificationBell userId={user.id} />}

          {/* User info */}
          <div className="flex items-center gap-2 pl-1">
            <span className="hidden text-sm text-gray-500 sm:block">
              {profile?.nombre || profile?.email}
            </span>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                {profile?.nombre?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
