import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, roleLabels, UserRole } from '@/lib/auth'
import { useCartStore } from '@/stores/cart-store'
import { SignOut, Bell, UserSwitch, ShoppingCart } from '@phosphor-icons/react'

interface HeaderProps {
  user: User
  onLogout: () => void
  onRoleSwitch?: (role: UserRole) => void
}

export function Header({ user, onLogout, onRoleSwitch }: HeaderProps) {
  const { getTotalItems, setIsOpen } = useCartStore()

  const handleRoleChange = (role: string) => {
    if (onRoleSwitch) {
      onRoleSwitch(role as UserRole)
    }
  }

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">SupplySync ERP</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Bell size={18} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart size={18} />
            {getTotalItems() > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {getTotalItems()}
              </Badge>
            )}
          </Button>

          {/* Role Switcher for testing */}
          {onRoleSwitch && (
            <div className="flex items-center gap-2">
              <UserSwitch size={16} className="text-muted-foreground" />
              <Select value={user.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
            <div className="text-sm">
              <div className="font-medium">{user.fullName}</div>
              <div className="text-muted-foreground">{user.assignment.name}</div>
            </div>
            <Badge variant="secondary">{roleLabels[user.role]}</Badge>
          </div>

          <Button variant="ghost" size="sm" onClick={onLogout}>
            <SignOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  )
}