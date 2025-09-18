import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserRole, hasPermission, roleLabels } from '@/lib/auth'
import { NavigationView } from '@/App'
import { House, Package, ShoppingCart, ChartLineUp, ClipboardText, ChartBar, FileText, Stack, Users, LockKey, Palette, Truck, Flag } from '@phosphor-icons/react'

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
    id: 'goods-receipt' as NavigationView,
    label: 'Goods Receipt',
    icon: Truck,
    requiredPermission: 'canCreateOrders' as const
  },
  {
    id: 'variance-resolution' as NavigationView,
    label: 'Variance Resolution',
    icon: Flag,
    requiredPermission: 'canApproveOrders' as const
  },
  {
    id: 'inventory' as NavigationView,
    label: 'Inventory',
    icon: Stack,
    requiredPermission: 'canViewInventory' as const
  },
  {
    id: 'analytics' as NavigationView,
    label: 'Analytics',
    icon: ChartBar,
    requiredPermission: 'canAccessAnalytics' as const
  },
  {
    id: 'reports' as NavigationView,
    label: 'Reports',
    icon: FileText,
    requiredPermission: 'canAccessReports' as const
  },
  {
    id: 'audit' as NavigationView,
    label: 'Audit',
    icon: ClipboardText,
    requiredPermission: 'canAccessAudit' as const
  },
  {
    id: 'users' as NavigationView,
    label: 'Users',
    icon: Users,
    requiredPermission: 'canManageUsers' as const
  },
  {
    id: 'components' as NavigationView,
    label: 'Components',
    icon: Palette,
    requiredPermission: null
  }
]

export function Sidebar({ userRole, currentView, onViewChange }: SidebarProps) {
  const visibleItems = navigationItems.filter(item =>
    !item.requiredPermission || hasPermission(userRole, item.requiredPermission)
  )

  const hiddenItems = navigationItems.filter(item =>
    item.requiredPermission && !hasPermission(userRole, item.requiredPermission)
  )

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'destructive'
      case 'FM': return 'default'
      case 'DM': return 'secondary'
      case 'COST_ANALYST': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ChartLineUp size={24} className="text-primary" />
          <span className="font-semibold text-lg">SupplySync</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Role:</span>
          <Badge variant={getRoleBadgeVariant(userRole)} className="text-xs">
            {roleLabels[userRole]}
          </Badge>
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

          {/* Show restricted items with lock icon if any exist */}
          {hiddenItems.length > 0 && (
            <div className="pt-2 mt-2 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2 px-3">Restricted Access</div>
              {hiddenItems.slice(0, 2).map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={`restricted-${item.id}`}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 opacity-50 cursor-not-allowed"
                    disabled
                    onClick={() => {
                      // Show a toast when trying to access restricted content
                      console.log(`Access denied: ${item.label} requires additional permissions`)
                    }}
                  >
                    <div className="relative">
                      <Icon size={18} />
                      <LockKey size={10} className="absolute -top-1 -right-1 text-muted-foreground" />
                    </div>
                    {item.label}
                  </Button>
                )
              })}
              {hiddenItems.length > 2 && (
                <div className="text-xs text-muted-foreground px-3 py-2">
                  +{hiddenItems.length - 2} more restricted
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="mb-1">Access Level: {visibleItems.length} of {navigationItems.length} modules</div>
          <div className="text-xs opacity-75">
            {userRole === 'SM' && 'Store Operations'}
            {userRole === 'DM' && 'District Management'}
            {userRole === 'FM' && 'Facility Oversight'}
            {userRole === 'ADMIN' && 'System Administration'}
            {userRole === 'COST_ANALYST' && 'Financial Analysis'}
            {userRole === 'AI_AGENT' && 'Automated Operations'}
          </div>
        </div>
      </div>
    </aside>
  )
}