import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserRole, hasPermission } from '@/lib/auth'
import { NavigationView } from '@/App'
import { House, Package, ShoppingCart, ChartLineUp, ClipboardText } from '@phosphor-icons/react'

interface SidebarProps {
  userRole: UserRole
  currentView: NavigationView
  onViewChange: (view: NavigationView) => void
}

const navigationItems = [
  {
    id: 'dashboard' as NavigationView,
    label: 'Dashboard',
    icon: House,
    requiredPermission: null
  },
  {
    id: 'catalog' as NavigationView,
    label: 'Catalog',
    icon: Package,
    requiredPermission: 'canCreateOrders' as const
  },
  {
    id: 'orders' as NavigationView,
    label: 'Orders',
    icon: ShoppingCart,
    requiredPermission: null
  },
  {
    id: 'audit' as NavigationView,
    label: 'Audit',
    icon: ClipboardText,
    requiredPermission: 'canAccessAudit' as const
  }
]

export function Sidebar({ userRole, currentView, onViewChange }: SidebarProps) {
  const visibleItems = navigationItems.filter(item => 
    !item.requiredPermission || hasPermission(userRole, item.requiredPermission)
  )

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <ChartLineUp size={24} className="text-primary" />
          <span className="font-semibold text-lg">SupplySync</span>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive && "bg-accent/10 text-accent-foreground"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}