import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApproveDialog, RejectDialog } from '@/components/ui/approval-dialog'
import type { UserRole } from '@/lib/auth'
import { hasPermission } from '@/lib/auth'
import { toast } from 'sonner'
import { ShoppingCart, Clock, CheckCircle, Package, Eye } from '@phosphor-icons/react'

interface OrdersViewProps {
  userRole: UserRole
  userId: string
}

interface Order {
  orderId: string
  storeId: string
  storeName: string
  orderType: 'REPLENISHMENT' | 'AD_HOC'
  status: string
  lineItemCount: number
  totalCost?: number
  createdAt: string
  createdByUserId: string
}

const sampleOrders: Order[] = [
  {
    orderId: 'order-001',
    storeId: 'store-001',
    storeName: 'Downtown LA',
    orderType: 'AD_HOC',
    status: 'PENDING_DM_APPROVAL',
    lineItemCount: 3,
    totalCost: 125.50,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdByUserId: 'demo-sm-1'
  },
  {
    orderId: 'order-002',
    storeId: 'store-001',
    storeName: 'Downtown LA',
    orderType: 'REPLENISHMENT',
    status: 'IN_TRANSIT',
    lineItemCount: 8,
    totalCost: 450.00,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdByUserId: 'ai-agent'
  },
  {
    orderId: 'order-003',
    storeId: 'store-002',
    storeName: 'Beverly Hills',
    orderType: 'AD_HOC',
    status: 'RECEIVED_COMPLETE',
    lineItemCount: 2,
    totalCost: 75.99,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    createdByUserId: 'demo-sm-2'
  },
  {
    orderId: 'order-004',
    storeId: 'store-003',
    storeName: 'Santa Monica',
    orderType: 'AD_HOC',
    status: 'PENDING_FM_APPROVAL',
    lineItemCount: 1,
    totalCost: 899.99,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdByUserId: 'demo-sm-3'
  },
  {
    orderId: 'order-005',
    storeId: 'store-004',
    storeName: 'West Hollywood',
    orderType: 'AD_HOC',
    status: 'PENDING_DM_APPROVAL',
    lineItemCount: 5,
    totalCost: 234.50,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdByUserId: 'demo-sm-4'
  }
]

export function OrdersView({ userRole, userId }: OrdersViewProps) {
  const [orders, setOrders] = useKV<Order[]>('orders', sampleOrders)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const getFilteredOrders = (filter: string) => {
    if (!orders) return []

    let filtered = orders

    if (userRole === 'SM') {
      filtered = orders.filter(order => order.createdByUserId === userId)
    }

    switch (filter) {
      case 'pending':
        return filtered.filter(order =>
          order.status.includes('PENDING') || order.status === 'IN_TRANSIT'
        )
      case 'completed':
        return filtered.filter(order =>
          order.status === 'RECEIVED_COMPLETE' || order.status === 'CLOSED'
        )
      case 'approvals':
        if (userRole === 'DM') {
          return filtered.filter(order => order.status === 'PENDING_DM_APPROVAL')
        }
        if (userRole === 'FM') {
          return filtered.filter(order => order.status === 'PENDING_FM_APPROVAL')
        }
        return []
      default:
        return filtered
    }
  }

  const getStatusColor = (status: string) => {
    if (status.includes('PENDING')) return 'destructive'
    if (status === 'IN_TRANSIT') return 'default'
    if (status.includes('RECEIVED') || status === 'CLOSED') return 'secondary'
    return 'outline'
  }

  const getStatusIcon = (status: string) => {
    if (status.includes('PENDING')) return <Clock size={16} />
    if (status === 'IN_TRANSIT') return <Package size={16} />
    if (status.includes('RECEIVED') || status === 'CLOSED') return <CheckCircle size={16} />
    return <ShoppingCart size={16} />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleApproveOrder = async (reason?: string) => {
    if (!selectedOrder) return

    setIsProcessing(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update order status based on user role and current status
      let newStatus = selectedOrder.status

      if (userRole === 'DM' && selectedOrder.status === 'PENDING_DM_APPROVAL') {
        newStatus = 'PENDING_FM_APPROVAL'
      } else if (userRole === 'FM' && selectedOrder.status === 'PENDING_FM_APPROVAL') {
        newStatus = 'APPROVED_FOR_FULFILLMENT'
      }

      // Update the order in the state
      setOrders(currentOrders =>
        currentOrders?.map(order =>
          order.orderId === selectedOrder.orderId
            ? { ...order, status: newStatus }
            : order
        ) || []
      )

      // Show success toast
      toast.success(`Order #${selectedOrder.orderId.slice(-6)} approved.`, {
        description: `Status updated to ${newStatus.replace(/_/g, ' ').toLowerCase()}.`
      })

      // Reset state
      setSelectedOrder(null)
      setShowApproveDialog(false)

    } catch (error) {
      toast.error('Failed to approve order', {
        description: 'Please try again or contact support.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectOrder = async (reason?: string) => {
    if (!selectedOrder || !reason) return

    setIsProcessing(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update order status to REJECTED
      setOrders(currentOrders =>
        currentOrders?.map(order =>
          order.orderId === selectedOrder.orderId
            ? { ...order, status: 'REJECTED' }
            : order
        ) || []
      )

      // Show success toast
      toast.success(`Order #${selectedOrder.orderId.slice(-6)} rejected.`, {
        description: 'The order has been rejected and the store manager has been notified.'
      })

      // Reset state
      setSelectedOrder(null)
      setShowRejectDialog(false)

    } catch (error) {
      toast.error('Failed to reject order', {
        description: 'Please try again or contact support.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const openApproveDialog = (order: Order) => {
    setSelectedOrder(order)
    setShowApproveDialog(true)
  }

  const openRejectDialog = (order: Order) => {
    setSelectedOrder(order)
    setShowRejectDialog(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const canViewCosts = hasPermission(userRole, 'canViewCosts')
  const canApprove = hasPermission(userRole, 'canApproveOrders')

  const tabs = [
    { id: 'all', label: 'All Orders', count: getFilteredOrders('all').length },
    { id: 'pending', label: 'Pending', count: getFilteredOrders('pending').length },
    { id: 'completed', label: 'Completed', count: getFilteredOrders('completed').length }
  ]

  if (canApprove) {
    tabs.push({
      id: 'approvals',
      label: 'Approvals',
      count: getFilteredOrders('approvals').length
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          {userRole === 'SM' ? 'Manage your store orders' : 'View and manage orders'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <div className="grid gap-4">
              {getFilteredOrders(tab.id).length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground">
                      {tab.id === 'approvals'
                        ? 'No orders pending your approval'
                        : `No ${tab.label.toLowerCase()} at this time`
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getFilteredOrders(tab.id).map((order) => (
                  <Card key={order.orderId}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            Order #{order.orderId.slice(-6)}
                          </CardTitle>
                          <CardDescription>
                            {order.storeName} • {order.lineItemCount} items • {order.orderType}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Created: {formatDate(order.createdAt)}
                          </p>
                          {canViewCosts && order.totalCost && (
                            <p className="text-sm font-semibold">
                              Total: {formatCurrency(order.totalCost)}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye size={16} className="mr-2" />
                            View Details
                          </Button>

                          {tab.id === 'approvals' && canApprove && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRejectDialog(order)}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => openApproveDialog(order)}
                              >
                                Approve
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Approval Dialog */}
      {selectedOrder && (
        <ApproveDialog
          open={showApproveDialog}
          onOpenChange={setShowApproveDialog}
          title="Approve Order"
          description={`Are you sure you want to approve this order? It will proceed to the next stage in the workflow.`}
          itemName={`Order #${selectedOrder.orderId.slice(-6)}`}
          itemDetails={{
            store: selectedOrder.storeName,
            orderType: selectedOrder.orderType,
            lineItems: `${selectedOrder.lineItemCount} items`,
            totalCost: selectedOrder.totalCost ? formatCurrency(selectedOrder.totalCost) : 'N/A',
            currentStatus: selectedOrder.status.replace(/_/g, ' ')
          }}
          onConfirm={handleApproveOrder}
          onCancel={() => {
            setSelectedOrder(null)
            setShowApproveDialog(false)
          }}
          loading={isProcessing}
        />
      )}

      {/* Rejection Dialog */}
      {selectedOrder && (
        <RejectDialog
          open={showRejectDialog}
          onOpenChange={setShowRejectDialog}
          title="Reject Order"
          description="Please provide a reason for rejecting this order. This is required for audit purposes."
          itemName={`Order #${selectedOrder.orderId.slice(-6)}`}
          itemDetails={{
            store: selectedOrder.storeName,
            orderType: selectedOrder.orderType,
            lineItems: `${selectedOrder.lineItemCount} items`,
            totalCost: selectedOrder.totalCost ? formatCurrency(selectedOrder.totalCost) : 'N/A',
            currentStatus: selectedOrder.status.replace(/_/g, ' ')
          }}
          reasonLabel="Rejection Reason"
          reasonPlaceholder="Please explain why this order is being rejected..."
          onConfirm={handleRejectOrder}
          onCancel={() => {
            setSelectedOrder(null)
            setShowRejectDialog(false)
          }}
          loading={isProcessing}
        />
      )}
    </div>
  )
}