import { UserProvider } from '@/contexts/UserContext'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }) {
  // Fetch user server-side where cookies are accessible
  let initialUser = null
  let initialProfile = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      initialUser = user
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      initialProfile = profile
    }
  } catch {
    // Continue without auth data — client will retry
  }

  return (
    <UserProvider initialUser={initialUser} initialProfile={initialProfile}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </UserProvider>
  )
}
