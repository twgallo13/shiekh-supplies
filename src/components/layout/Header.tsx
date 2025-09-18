import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, roleLabels } from '@/lib/auth'
import { SignOut, Bell } from '@phosphor-icons/react'

interface HeaderProps {
  user: User
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
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