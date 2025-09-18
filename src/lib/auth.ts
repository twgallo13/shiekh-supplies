export type UserRole = 'SM' | 'DM' | 'FM' | 'ADMIN' | 'COST_ANALYST' | 'AI_AGENT'

export interface User {
  userId: string
  fullName: string
  email: string
  role: UserRole
  assignment: {
    type: 'store' | 'district' | 'region' | 'system'
    id: string
    name: string
  }
}

export const roleLabels: Record<UserRole, string> = {
  'SM': 'Store Manager',
  'DM': 'District Manager',
  'FM': 'Facility Manager',
  'ADMIN': 'Administrator',
  'COST_ANALYST': 'Cost Analyst',
  'AI_AGENT': 'AI Agent'
}

export const rolePermissions = {
  SM: {
    canCreateOrders: true,
    canApproveOrders: false,
    canViewAllStores: false,
    canAccessAudit: false,
    canViewCosts: false,
    canAccessAnalytics: false,
    canManageUsers: false,
    canViewInventory: true,
    canAccessReports: false
  },
  DM: {
    canCreateOrders: true,
    canApproveOrders: true,
    canViewAllStores: false, // Only district stores
    canAccessAudit: false,
    canViewCosts: false,
    canAccessAnalytics: true,
    canManageUsers: false,
    canViewInventory: true,
    canAccessReports: true
  },
  FM: {
    canCreateOrders: true,
    canApproveOrders: true,
    canViewAllStores: true,
    canAccessAudit: false,
    canViewCosts: true,
    canAccessAnalytics: true,
    canManageUsers: false,
    canViewInventory: true,
    canAccessReports: true
  },
  ADMIN: {
    canCreateOrders: false,
    canApproveOrders: false,
    canViewAllStores: true,
    canAccessAudit: true,
    canViewCosts: true,
    canAccessAnalytics: true,
    canManageUsers: true,
    canViewInventory: true,
    canAccessReports: true
  },
  COST_ANALYST: {
    canCreateOrders: false,
    canApproveOrders: false,
    canViewAllStores: true,
    canAccessAudit: true,
    canViewCosts: true,
    canAccessAnalytics: true,
    canManageUsers: false,
    canViewInventory: true,
    canAccessReports: true
  },
  AI_AGENT: {
    canCreateOrders: true,
    canApproveOrders: false,
    canViewAllStores: true,
    canAccessAudit: false,
    canViewCosts: true,
    canAccessAnalytics: false,
    canManageUsers: false,
    canViewInventory: true,
    canAccessReports: false
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const sparkUser = await (window as any).spark?.user?.()

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
      },
      {
        userId: 'demo-analyst-1',
        fullName: 'Jennifer Liu',
        email: 'jennifer.liu@supplysync.com',
        role: 'COST_ANALYST',
        assignment: { type: 'system', id: 'system', name: 'System Wide' }
      }
    ]

    const userIndex = Math.floor(Date.now() / 60000) % demoUsers.length
    return demoUsers[userIndex]
  } catch (error) {
    return {
      userId: 'demo-sm-1',
      fullName: 'Sarah Chen',
      email: 'sarah.chen@supplysync.com',
      role: 'SM',
      assignment: { type: 'store', id: 'store-001', name: 'Downtown LA' }
    }
  }
}

export function hasPermission(role: UserRole, permission: keyof typeof rolePermissions.SM): boolean {
  return rolePermissions[role][permission]
}

/**
 * Check if user has access to a specific navigation view
 */
export function canAccessView(role: UserRole, view: string): boolean {
  const viewPermissions = {
    'dashboard': null, // Everyone can access dashboard
    'catalog': 'canCreateOrders',
    'orders': null, // Everyone can view their orders
    'goods-receipt': 'canCreateOrders', // SM role for receiving goods
    'variance-resolution': 'canApproveOrders', // FM role for resolving variances
    'inventory': 'canViewInventory',
    'analytics': 'canAccessAnalytics',
    'reports': 'canAccessReports',
    'audit': 'canAccessAudit',
    'users': 'canManageUsers',
    'components': null // Everyone can access component demos
  } as const

  const requiredPermission = viewPermissions[view as keyof typeof viewPermissions]
  if (!requiredPermission) return true

  return hasPermission(role, requiredPermission as keyof typeof rolePermissions.SM)
}