import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserRole, rolePermissions, roleLabels } from '@/lib/auth'
import { Check, X } from '@phosphor-icons/react'

interface RolePermissionsDemoProps {
  userRole: UserRole
}

const permissionLabels = {
  canCreateOrders: 'Create Orders',
  canApproveOrders: 'Approve Orders',  
  canViewAllStores: 'View All Stores',
  canAccessAudit: 'Access Audit Logs',
  canViewCosts: 'View Cost Data',
  canAccessAnalytics: 'Access Analytics',
  canManageUsers: 'Manage Users',
  canViewInventory: 'View Inventory',
  canAccessReports: 'Access Reports'
}

export function RolePermissionsDemo({ userRole }: RolePermissionsDemoProps) {
  const permissions = rolePermissions[userRole]
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Current Role Permissions
          <Badge variant="secondary">{roleLabels[userRole]}</Badge>
        </CardTitle>
        <CardDescription>
          This shows what your current role can access. Switch roles using the dropdown in the header to see different permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {Object.entries(permissionLabels).map(([key, label]) => {
            const hasPermission = permissions[key as keyof typeof permissions]
            return (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex items-center gap-2">
                  {hasPermission ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <X size={16} className="text-red-600" />
                  )}
                  <Badge variant={hasPermission ? "default" : "secondary"} className="text-xs">
                    {hasPermission ? 'Allowed' : 'Denied'}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}