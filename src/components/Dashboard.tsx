import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, roleLabels, hasPermission } from '@/lib/auth'
import { RolePermissionsDemo } from './demo/RolePermissionsDemo'
import { ShoppingCart, Package, Clock, Warning, TrendUp, CheckCircle } from '@phosphor-icons/react'

interface DashboardProps {
  user: User
}

interface Order {
  orderId: string
  storeId: string
  orderType: 'REPLENISHMENT' | 'AD_HOC'
  status: string
  lineItemCount: number
  totalCost?: number
  createdAt: string
  storeName: string
}

interface DashboardStats {
  pendingOrders: number
  totalOrders: number
  totalCost: number
  completedToday: number
}

export function Dashboard({ user }: DashboardProps) {
  const [orders, setOrders] = useKV<Order[]>('orders', [])
  const [stats, setStats] = useState<DashboardStats>({
    pendingOrders: 0,
    totalOrders: 0,
    totalCost: 0,
    completedToday: 0
  })

  useEffect(() => {
    const calculateStats = () => {
      if (!orders || orders.length === 0) {
        setStats({
          pendingOrders: 0,
          totalOrders: 0,
          totalCost: 0,
          completedToday: 0
        })
        return
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const pending = orders.filter(o => 
        o.status.includes('PENDING') || o.status === 'IN_TRANSIT'
      ).length
      
      const completedToday = orders.filter(o => {
        const orderDate = new Date(o.createdAt)
        orderDate.setHours(0, 0, 0, 0)
        return orderDate.getTime() === today.getTime() && 
               (o.status === 'RECEIVED_COMPLETE' || o.status === 'CLOSED')
      }).length
      
      const totalCost = orders
        .filter(o => o.totalCost)
        .reduce((sum, o) => sum + (o.totalCost || 0), 0)

      setStats({
        pendingOrders: pending,
        totalOrders: orders.length,
        totalCost,
        completedToday
      })
    }

    calculateStats()
  }, [orders])

  const getRecentOrders = () => {
    if (!orders || orders.length === 0) return []
    
    return orders
      .filter(order => {
        if (user.role === 'SM') {
          return order.storeId === user.assignment.id
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }

  const getPendingApprovals = () => {
    if (!orders || orders.length === 0) return []
    
    return orders.filter(order => {
      if (user.role === 'DM' && order.status === 'PENDING_DM_APPROVAL') {
        return true
      }
      if (user.role === 'FM' && order.status === 'PENDING_FM_APPROVAL') {
        return true
      }
      return false
    })
  }

  const getStatusColor = (status: string) => {
    if (status.includes('PENDING')) return 'destructive'
    if (status === 'IN_TRANSIT') return 'default'
    if (status.includes('RECEIVED') || status === 'CLOSED') return 'secondary'
    return 'outline'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user.fullName}</h1>
        <p className="text-muted-foreground">
          {roleLabels[user.role]} - {user.assignment.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        {hasPermission(user.role, 'canViewCosts') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
              <p className="text-xs text-muted-foreground">
                Order value
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Received orders
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RolePermissionsDemo userRole={user.role} />
        
        {(user.role === 'DM' || user.role === 'FM') && getPendingApprovals().length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warning size={20} className="text-accent" />
                Pending Approvals
              </CardTitle>
              <CardDescription>
                Orders awaiting your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getPendingApprovals().map((order) => (
                  <div key={order.orderId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{order.storeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.lineItemCount} items • {order.orderType}
                      </p>
                    </div>
                    <Button size="sm">Review</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest order activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecentOrders().length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              ) : (
                getRecentOrders().map((order) => (
                  <div key={order.orderId} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.storeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.lineItemCount} items • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}