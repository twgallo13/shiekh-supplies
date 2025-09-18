import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { User, roleLabels } from '@/lib/auth'
import { Building, Users, Gear, ChartBar } from '@phosphor-icons/react'

interface LoginScreenProps {
  onLogin: (user: User) => void
}

const demoUsers: User[] = [
  {
    userId: 'demo-sm-1',
    fullName: 'Sarah Chen',
    email: 'sarah.chen@supplysync.com',
    role: 'SM',
    assignment: { type: 'store', id: 'store-001', name: 'Downtown LA' }
  },
  {
    userId: 'demo-dm-1', 
    fullName: 'Marcus Johnson',
    email: 'marcus.johnson@supplysync.com',
    role: 'DM',
    assignment: { type: 'district', id: 'district-west', name: 'West Coast District' }
  },
  {
    userId: 'demo-fm-1',
    fullName: 'Elena Rodriguez',
    email: 'elena.rodriguez@supplysync.com', 
    role: 'FM',
    assignment: { type: 'region', id: 'region-west', name: 'Western Region' }
  },
  {
    userId: 'demo-admin-1',
    fullName: 'David Kim',
    email: 'david.kim@supplysync.com',
    role: 'ADMIN',
    assignment: { type: 'system', id: 'system', name: 'System Wide' }
  }
]

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'SM': return <Building size={20} />
    case 'DM': return <Users size={20} />
    case 'FM': return <ChartBar size={20} />
    case 'ADMIN': return <Gear size={20} />
    default: return <Building size={20} />
  }
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  const handleLogin = () => {
    const user = demoUsers.find(u => u.userId === selectedUserId)
    if (user) {
      onLogin(user)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SupplySync ERP</CardTitle>
          <CardDescription>
            Select a demo user to explore the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Demo User</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user role..." />
              </SelectTrigger>
              <SelectContent>
                {demoUsers.map((user) => (
                  <SelectItem key={user.userId} value={user.userId}>
                    <div className="flex items-center gap-3">
                      {getRoleIcon(user.role)}
                      <div className="flex flex-col">
                        <span>{user.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {roleLabels[user.role]} - {user.assignment.name}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUserId && (
            <div className="p-3 bg-muted rounded-lg">
              {(() => {
                const user = demoUsers.find(u => u.userId === selectedUserId)
                if (!user) return null
                
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className="font-medium">{user.fullName}</span>
                      <Badge variant="secondary">{roleLabels[user.role]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Access: {user.assignment.name}
                    </p>
                  </div>
                )
              })()}
            </div>
          )}

          <Button 
            onClick={handleLogin} 
            disabled={!selectedUserId}
            className="w-full"
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}