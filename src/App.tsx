import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { LoginScreen } from './components/auth/LoginScreen'
import { Dashboard } from './components/Dashboard'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Catalog } from './components/catalog/Catalog'
import { OrdersView } from './components/orders/OrdersView'
import { AuditDashboard } from './components/audit/AuditDashboard'
import { UserRole, getCurrentUser } from './lib/auth'

export type NavigationView = 'dashboard' | 'catalog' | 'orders' | 'audit'

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

  const renderView = () => {
    switch (currentView) {
      case 'catalog':
        return <Catalog userRole={currentUser.role} />
      case 'orders':
        return <OrdersView userRole={currentUser.role} userId={currentUser.userId} />
      case 'audit':
        return <AuditDashboard />
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
          onViewChange={setCurrentView}
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