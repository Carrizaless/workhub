import { UserProvider } from '@/contexts/UserContext'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function AppLayout({ children }) {
  return (
    <UserProvider>
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
