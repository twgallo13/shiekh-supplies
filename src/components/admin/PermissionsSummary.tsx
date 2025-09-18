import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserRole, roleLabels, rolePermissions } from '@/lib/auth'
import { CheckCircle, XCircle } from '@phosphor-icons/react'

export function PermissionsSummary() {
  const allPermissions = Object.keys(rolePermissions.ADMIN) as Array<keyof typeof rolePermissions.SM>
  const roles = Object.keys(roleLabels) as UserRole[]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions Matrix</CardTitle>
        <CardDescription>
          Overview of permissions by role in SupplySync ERP
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium">Permission</th>
                {roles.map(role => (
                  <th key={role} className="text-center py-2 px-2 font-medium">
                    <Badge variant="outline" className="text-xs">
                      {role}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPermissions.map(permission => (
                <tr key={permission} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium text-sm">
                    {permission.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())}
                  </td>
                  {roles.map(role => {
                    const hasPermission = rolePermissions[role][permission]
                    return (
                      <td key={`${role}-${permission}`} className="text-center py-3 px-2">
                        {hasPermission ? (
                          <CheckCircle size={16} className="text-green-600 mx-auto" />
                        ) : (
                          <XCircle size={16} className="text-red-500 mx-auto" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => {
            const permissions = rolePermissions[role]
            const permissionCount = Object.values(permissions).filter(Boolean).length
            const totalPermissions = Object.keys(permissions).length
            
            return (
              <Card key={role} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{roleLabels[role]}</h4>
                  <Badge variant="secondary">
                    {permissionCount}/{totalPermissions}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {role === 'SM' && 'Store-level operations and ordering'}
                  {role === 'DM' && 'District oversight and approvals'}
                  {role === 'FM' && 'Facility management and logistics'}
                  {role === 'ADMIN' && 'System administration and audit'}
                  {role === 'COST_ANALYST' && 'Financial analysis and reporting'}
                  {role === 'AI_AGENT' && 'Automated operations and forecasting'}
                </div>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}