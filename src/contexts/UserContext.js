'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const UserContext = createContext(null)

export function UserProvider({ children, initialUser = null, initialProfile = null }) {
  // Use server-provided data immediately (no loading flash)
  const [user, setUser] = useState(initialUser)
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(!initialUser)
  const supabaseRef = useRef(null)
  if (!supabaseRef.current) supabaseRef.current = createClient()
  const supabase = supabaseRef.current

  useEffect(() => {
    // If we already have initial data from server, skip client-side fetch
    if (initialUser) {
      setLoading(false)
    } else {
      // Fallback: try client-side auth (for local dev or if server fetch failed)
      async function loadUser() {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser()

          if (authUser) {
            setUser(authUser)
            const { data: profileData } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .single()
            setProfile(profileData)
          }
        } catch {
          // Supabase not configured yet — continue without auth
        }
        setLoading(false)
      }
      loadUser()
    }

    // Listen for auth state changes (login/logout from other tabs, token refresh)
    let subscription
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        } else if (session?.user) {
          setUser(session.user)
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(profileData)
        }
      })
      subscription = data.subscription
    } catch {
      // Supabase not configured yet
    }

    return () => subscription?.unsubscribe()
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}
