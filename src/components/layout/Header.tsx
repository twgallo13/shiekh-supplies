import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, roleLabels, UserRole } from '@/lib/auth'
import { useCartStore } from '@/stores/cart-store'
import { SignOut, Bell, UserSwitch, ShoppingCart } from '@phosphor-icons/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNotifications } from '@/store/notifications-store'
import { formatDistanceToNow } from 'date-fns'

interface HeaderProps {
  user: User
  onLogout: () => void
  onRoleSwitch?: (role: UserRole) => void
}

export function Header({ user, onLogout, onRoleSwitch }: HeaderProps) {
  const { getTotalItems, setIsOpen } = useCartStore()
  const {
    notifications,
    unreadCount,
    markAllAsRead,
  } = useNotifications()

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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <span className="font-semibold">Notifications</span>
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-muted-foreground text-center">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b last:border-b-0 flex flex-col gap-1 ${!n.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <div className="text-sm">{n.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

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