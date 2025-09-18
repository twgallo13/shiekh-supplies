import { ReactNode } from 'react'
import { UserRole, hasPermission, rolePermissions } from '@/lib/auth'
import { LockKey } from '@phosphor-icons/react'

interface PermissionGuardProps {
  userRole: UserRole
  permission: keyof typeof rolePermissions.SM
  children: ReactNode
  fallback?: ReactNode
  showLocked?: boolean
}

/**
 * Component that conditionally renders content based on user permissions
 */
export function PermissionGuard({ 
  userRole, 
  permission, 
  children, 
  fallback,
  showLocked = false 
}: PermissionGuardProps) {
  const hasAccess = hasPermission(userRole, permission)
  
  if (hasAccess) {
    return <>{children}</>
  }
  
  if (fallback) {
    return <>{fallback}</>
  }
  
  if (showLocked) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <LockKey size={16} />
        <span className="text-sm">Access restricted</span>
      </div>
    )
  }
  
  return null
}