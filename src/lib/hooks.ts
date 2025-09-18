import { useContext, createContext } from 'react'
import { UserRole, hasPermission, canAccessView, rolePermissions } from './auth'

/**
 * Hook to check user permissions
 */
export function usePermissions(userRole: UserRole) {
  return {
    hasPermission: (permission: keyof typeof rolePermissions.SM) => hasPermission(userRole, permission),
    canAccessView: (view: string) => canAccessView(userRole, view),
    permissions: rolePermissions[userRole]
  }
}