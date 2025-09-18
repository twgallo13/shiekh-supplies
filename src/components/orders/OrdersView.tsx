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
import { useNotifications } from '@/store/notifications-store'

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
  lineItems: any[]
  auditTrail: any[]
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
    lineItems: [],
    auditTrail: [],
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
    lineItems: [],
    auditTrail: [],
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
    lineItems: [],
    auditTrail: [],
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
    lineItems: [],
    auditTrail: [],
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
    lineItems: [],
    auditTrail: [],
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
  const { addNotification } = useNotifications()

  // Substitution dialog state
  const [showSubDialog, setShowSubDialog] = useState(false)
  const [subOrder, setSubOrder] = useState<Order | null>(null)
  const [subLineItem, setSubLineItem] = useState<any>(null)
  const [subProductId, setSubProductId] = useState('')
  const [subReason, setSubReason] = useState('')
  const [subLoading, setSubLoading] = useState(false)

  // Get products from catalog
  const [productsRaw] = useKV<any[]>('products', [])
  // Always fallback to array
  const products = Array.isArray(productsRaw) ? productsRaw : (productsRaw ? [productsRaw] : [])

  const openSubDialog = (order: Order, lineItem: any) => {
    setSubOrder(order)
    setSubLineItem(lineItem)
    setShowSubDialog(true)
    setSubProductId('')
    setSubReason('')
  }

  const handleSubstitute = async () => {
    if (!subOrder || !subLineItem || !subProductId || !subReason) return
    setSubLoading(true)
    try {
      const product = products.find(p => p.productId === subProductId)
      if (!product) throw new Error('Product not found')
      setOrders(currentOrders =>
        currentOrders?.map(order => {
          if (order.orderId !== subOrder.orderId) return order
          return {
            ...order,
            lineItems: order.lineItems.map(li =>
              li.lineItemId === subLineItem.lineItemId
                ? {
                  ...li,
                  isSubstituted: true,
                  substitutedProductId: product.productId,
                  substitutedProductName: product.productName,
                  substitutedCostPerUnit: product.costPerUnit,
                  substitutionReason: subReason
                }
                : li
            ),
            auditTrail: [
              ...order.auditTrail,
              {
                timestamp: new Date().toISOString(),
                actor: userId,
                action: 'SUBSTITUTED_LINE_ITEM',
                details: `Substituted ${subLineItem.productName} with ${product.productName} (Reason: ${subReason})`,
                reasonCode: 'COST_OPTIMIZATION'
              }
            ]
          }
        }) || []
      )
      // Notification
      addNotification({
        id: `${subOrder.orderId}-sub-${Date.now()}`,
        message: `Line item substituted in Order #${subOrder.orderId} by ${userRole}.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        orderId: subOrder.orderId
      })
      // Toast
      toast.success('Line item substituted', {
        description: `Substituted ${subLineItem.productName} with ${product.productName}. Savings: $${((subLineItem.costPerUnit - product.costPerUnit) * subLineItem.quantityOrdered).toFixed(2)}`
      })
      setShowSubDialog(false)
      setSubOrder(null)
      setSubLineItem(null)
    } catch (e: any) {
      toast.error('Substitution failed', { description: e.message })
    } finally {
      setSubLoading(false)
    }
  }

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

      // Add notification for original SM
      addNotification({
        id: `${selectedOrder.orderId}-approved-${Date.now()}`,
        message: `Order #${selectedOrder.orderId} has been approved by ${userRole}.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        orderId: selectedOrder.orderId,
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

      // Show error toast
      toast.error(`Order #${selectedOrder.orderId.slice(-6)} rejected.`, {
        description: `Reason: ${reason}`
      })

      // Add notification for original SM
      addNotification({
        id: `${selectedOrder.orderId}-rejected-${Date.now()}`,
        message: `Order #${selectedOrder.orderId} has been rejected by ${userRole}. Reason: ${reason}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        orderId: selectedOrder.orderId,
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
                              {/* Substitution button for DM/FM */}
                              {order.lineItems?.map(li => (
                                <Button
                                  key={li.lineItemId}
                                  variant="secondary"
                                  size="sm"
                                  disabled={li.isSubstituted}
                                  onClick={() => openSubDialog(order, li)}
                                >
                                  {li.isSubstituted ? 'Substituted' : 'Substitute'}
                                </Button>
                              ))}
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
      {/* Substitution Dialog */}
      {showSubDialog && subOrder && subLineItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">Substitute Line Item</h2>
            <p className="mb-2 text-sm text-muted-foreground">Order #{subOrder.orderId.slice(-6)} • {subLineItem.productName}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Substitute Product</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={subProductId}
                onChange={e => setSubProductId(e.target.value)}
              >
                <option value="">Choose product...</option>
                {products.filter(p => p.productId !== subLineItem.productId).map(p => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} (${p.costPerUnit})
                  </option>
                ))}
              </select>
              {/* Error display for missing product */}
              {!subProductId && (
                <div className="text-xs text-red-500 mt-1">Please select a substitute product.</div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Reason for Substitution</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={subReason}
                onChange={e => setSubReason(e.target.value)}
                placeholder="E.g. cost savings, supply issue..."
              />
              {/* Error display for missing reason */}
              {!subReason && (
                <div className="text-xs text-red-500 mt-1">Please provide a reason for substitution.</div>
              )}
            </div>
            {subProductId && (
              <div className="mb-4 text-sm">
                Savings: $
                {(() => {
                  const prod = products.find(p => p.productId === subProductId)
                  if (!prod) return '0.00'
                  return ((subLineItem.costPerUnit - prod.costPerUnit) * subLineItem.quantityOrdered).toFixed(2)
                })()}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSubDialog(false)} disabled={subLoading}>Cancel</Button>
              <Button onClick={handleSubstitute} disabled={subLoading || !subProductId || !subReason}>Confirm Substitute</Button>
            </div>
          </div>
        </div>
      )}
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