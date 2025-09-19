import { useEffect, useState } from 'react'
import { useMatch } from 'react-router-dom'
import { useKV } from '@github/spark/hooks'
import { LoginScreen } from './components/auth/LoginScreen'
import { Dashboard } from './components/Dashboard'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Catalog } from './components/catalog/Catalog'
import { ProductDetailsPage } from '@/components/catalog/ProductDetails'
import { CartSheet } from './components/cart/CartSheet'
import { OrdersView } from '@/components/orders/OrdersView'
import { GoodsReceiptView } from '@/components/orders/GoodsReceiptView'
import { OrderReceivingPage } from '@/components/orders/OrderReceivingPage'
import { VarianceResolutionView } from '@/components/orders/VarianceResolutionView'
import { VarianceResolutionPage } from '@/components/orders/VarianceResolutionPage'
import { AutomatedReplenishmentView } from '@/components/orders/AutomatedReplenishmentView'
import { AuditDashboard } from '@/components/audit/AuditDashboard'
import { PermissionsSummary } from '@/components/admin/PermissionsSummary'
import { ComponentsDemo } from '@/components/ui/components-demo'
import { Toaster } from '@/components/ui/sonner'
import { getCurrentUser, canAccessView, UserRole } from '@/lib/auth'
import { toast } from 'sonner'
import type { Order } from '@/types/orders'

export type NavigationView = 'dashboard' | 'catalog' | 'orders' | 'goods-receipt' | 'variance-resolution' | 'automated-replenishment' | 'audit' | 'analytics' | 'reports' | 'inventory' | 'users' | 'components'

function App() {
  const [currentUser, setCurrentUser] = useKV<any>('current_user', null)
  const [orders] = useKV<Order[]>('orders', [])
  const [currentView, setCurrentView] = useState<NavigationView>('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrderForReceiving, setSelectedOrderForReceiving] = useState<Order | null>(null)
  const [selectedOrderForVarianceResolution, setSelectedOrderForVarianceResolution] = useState<Order | null>(null)
  const productMatch = useMatch('/product/:productId')

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

  const handleRoleSwitch = (newRole: UserRole) => {
    const demoUsers = {
      'SM': {
        userId: 'demo-sm-1',
        fullName: 'Sarah Chen',
        email: 'sarah.chen@supplysync.com',
        role: 'SM' as UserRole,
        assignment: { type: 'store' as const, id: 'store-001', name: 'Downtown LA' }
      },
      'DM': {
        userId: 'demo-dm-1',
        fullName: 'Marcus Johnson',
        email: 'marcus.johnson@supplysync.com',
        role: 'DM' as UserRole,
        assignment: { type: 'district' as const, id: 'district-west', name: 'West Coast District' }
      },
      'FM': {
        userId: 'demo-fm-1',
        fullName: 'Elena Rodriguez',
        email: 'elena.rodriguez@supplysync.com',
        role: 'FM' as UserRole,
        assignment: { type: 'region' as const, id: 'region-west', name: 'Western Region' },
        permissions: ['manageProducts', 'viewCatalog']
      },
      'ADMIN': {
        userId: 'demo-admin-1',
        fullName: 'David Kim',
        email: 'david.kim@supplysync.com',
        role: 'ADMIN' as UserRole,
        assignment: { type: 'system' as const, id: 'system', name: 'System Wide' },
        permissions: ['manageProducts', 'viewCatalog']
      },
      'COST_ANALYST': {
        userId: 'demo-analyst-1',
        fullName: 'Jennifer Liu',
        email: 'jennifer.liu@supplysync.com',
        role: 'COST_ANALYST' as UserRole,
        assignment: { type: 'system' as const, id: 'system', name: 'System Wide' }
      },
      'AI_AGENT': {
        userId: 'demo-ai-1',
        fullName: 'AI Agent',
        email: 'ai.agent@supplysync.com',
        role: 'AI_AGENT' as UserRole,
        assignment: { type: 'system' as const, id: 'system', name: 'System Wide' }
      }
    }

    const newUser = demoUsers[newRole]
    setCurrentUser(newUser)

    // Reset view to dashboard when switching roles
    setCurrentView('dashboard')

    toast.success('Role switched', {
      description: `Now viewing as ${newUser.fullName} (${newRole})`
    })
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
      case 'goods-receipt':
        if (selectedOrderForReceiving) {
          return (
            <OrderReceivingPage
              order={selectedOrderForReceiving}
              onGoBack={() => setSelectedOrderForReceiving(null)}
              onOrderCompleted={(updatedOrder) => {
                // Handle order completion
                setSelectedOrderForReceiving(null)
              }}
            />
          )
        }
        return (
          <GoodsReceiptView
            userRole={currentUser.role}
            userId={currentUser.userId}
            onNavigateToReceiving={(order) => setSelectedOrderForReceiving(order)}
          />
        )
      case 'variance-resolution':
        if (selectedOrderForVarianceResolution) {
          return (
            <VarianceResolutionPage
              order={selectedOrderForVarianceResolution}
              onGoBack={() => setSelectedOrderForVarianceResolution(null)}
              onOrderResolved={(updatedOrder) => {
                // Handle order resolution
                setSelectedOrderForVarianceResolution(null)
              }}
            />
          )
        }
        return (
          <VarianceResolutionView
            userRole={currentUser.role}
            userId={currentUser.userId}
            onNavigateToResolution={(order) => setSelectedOrderForVarianceResolution(order)}
          />
        )
      case 'automated-replenishment':
        return (
          <AutomatedReplenishmentView
            userRole={currentUser.role}
            userId={currentUser.userId}
          />
        )
      case 'audit':
        return <AuditDashboard orders={orders ?? []} onNavigateToOrder={(orderId) => setCurrentView('orders')} />
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
      case 'components':
        return <ComponentsDemo />
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
          <Header
            user={currentUser}
            onLogout={handleLogout}
            onRoleSwitch={handleRoleSwitch}
          />
          <main className="p-6">
            {productMatch ? (
              <ProductDetailsPage
                productId={(productMatch.params as { productId?: string }).productId ?? ''}
                onBackToCatalog={() => { window.location.hash = "#/catalog" }}
              />
            ) : (
              renderView()
            )}
          </main>
        </div>
      </div>

      {/* Global Cart Sheet */}
      <CartSheet user={currentUser} />

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

export default App