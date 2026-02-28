'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
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
