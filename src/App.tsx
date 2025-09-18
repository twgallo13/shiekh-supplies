import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { LoginScreen } from './components/auth/LoginScreen'
import { Dashboard } from './components/Dashboard'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Catalog } from './components/catalog/Catalog'
import { OrdersView } from '@/components/orders/OrdersView'
import { AuditDashboard } from '@/components/audit/AuditDashboard'
import { PermissionsSummary } from '@/components/admin/PermissionsSummary'
import { getCurrentUser, canAccessView } from '@/lib/auth'
import type { UserRole } from '@/lib/auth'
import { toast } from 'sonner'

export type NavigationView = 'dashboard' | 'catalog' | 'orders' | 'audit' | 'analytics' | 'reports' | 'inventory' | 'users'

function App() {
  const [currentUser, setCurrentUser] = useKV<any>('current_user', null)
  const [currentView, setCurrentView] = useState<NavigationView>('dashboard')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (!currentUser) {
          const user = await getCurrentUser()
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('Failed to get user:', error)
        setCurrentUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeUser()
  }, [currentUser, setCurrentUser])

  const handleLogin = (userData: any) => {
    setCurrentUser(userData)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentView('dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />
  }

  const handleViewChange = (view: NavigationView) => {
    if (!canAccessView(currentUser.role, view)) {
      toast.error('Access Denied', {
        description: 'You do not have permission to access this section.'
      })
      return
    }
    setCurrentView(view)
  }

  const renderView = () => {
    // Double-check access before rendering
    if (!canAccessView(currentUser.role, currentView)) {
      return (
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-destructive">Access Denied</h1>
            <p className="text-muted-foreground mt-2">You do not have permission to access this section.</p>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'catalog':
        return <Catalog userRole={currentUser.role} />
      case 'orders':
        return <OrdersView userRole={currentUser.role} userId={currentUser.userId} />
      case 'audit':
        return <AuditDashboard />
      case 'analytics':
        return <div className="p-6"><h1 className="text-2xl font-semibold">Analytics Dashboard</h1><p className="text-muted-foreground">Analytics features coming soon...</p></div>
      case 'reports':
        return <div className="p-6"><h1 className="text-2xl font-semibold">Reports</h1><p className="text-muted-foreground">Reporting features coming soon...</p></div>
      case 'inventory':
        return <div className="p-6"><h1 className="text-2xl font-semibold">Inventory Management</h1><p className="text-muted-foreground">Inventory management coming soon...</p></div>
      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">User Management</h1>
              <p className="text-muted-foreground">Manage user roles and permissions</p>
            </div>
            <PermissionsSummary />
          </div>
        )
      default:
        return <Dashboard user={currentUser} />
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="flex">
        <Sidebar 
          userRole={currentUser.role}
          currentView={currentView}
          onViewChange={handleViewChange}
        />
        <div className="flex-1 min-h-screen">
          <Header user={currentUser} onLogout={handleLogout} />
          <main className="p-6">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App