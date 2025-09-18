import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { UserRole } from '@/lib/auth'
import type { Order, AuditEntry } from '@/types/orders'
import { ApprovalDialog } from '@/components/ui/approval-dialog'
import { toast } from 'sonner'
import { Robot, Package, CheckCircle, X, Clock, TrendUp, Sparkle } from '@phosphor-icons/react'

interface AutomatedReplenishmentViewProps {
    userRole: UserRole
    userId: string
}

// Sample AI-generated replenishment orders
const sampleReplenishmentOrders: Order[] = [
    {
        orderId: 'ai-replen-001',
        storeId: 'store-001',
        storeName: 'Downtown LA',
        orderType: 'REPLENISHMENT',
        status: 'PENDING_FM_APPROVAL',
        lineItemCount: 8,
        totalCost: 425.75,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdByUserId: 'ai-agent',
        justification: 'Predictive analysis indicates upcoming stockout risk for high-demand cleaning supplies. Based on 90-day consumption patterns and seasonal trends.',
        auditTrail: [
            {
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                actor: 'AI Agent',
                action: 'ORDER_CREATED',
                details: 'Automated replenishment order generated based on inventory forecasting model'
            }
        ],
        lineItems: [
            {
                lineItemId: 'ai-li-001',
                productId: 'prod-001',
                sku: 'GLASS-CLR-32OZ',
                productName: 'Glass Cleaner 32oz',
                quantityOrdered: 18,
                unitOfMeasure: 'Case',
                costPerUnit: 14.99,
                category: 'Cleaning Supplies'
            },
            {
                lineItemId: 'ai-li-002',
                productId: 'prod-002',
                sku: 'PAPER-TOWEL-12PK',
                productName: 'Paper Towels 12-Pack',
                quantityOrdered: 12,
                unitOfMeasure: 'Case',
                costPerUnit: 28.50,
                category: 'Paper Products'
            }
        ]
    },
    {
        orderId: 'ai-replen-002',
        storeId: 'store-002',
        storeName: 'Beverly Hills',
        orderType: 'REPLENISHMENT',
        status: 'PENDING_FM_APPROVAL',
        lineItemCount: 5,
        totalCost: 189.25,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        createdByUserId: 'ai-agent',
        justification: 'Weekly demand forecast suggests restocking office supplies. Historical data shows 15% increase in consumption during this period.',
        auditTrail: [
            {
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                actor: 'AI Agent',
                action: 'ORDER_CREATED',
                details: 'Automated replenishment order generated for Beverly Hills store based on demand forecasting'
            }
        ],
        lineItems: [
            {
                lineItemId: 'ai-li-003',
                productId: 'prod-003',
                sku: 'OFFICE-KIT-STD',
                productName: 'Office Supplies Kit',
                quantityOrdered: 8,
                unitOfMeasure: 'Kit',
                costPerUnit: 15.50,
                category: 'Office Supplies'
            },
            {
                lineItemId: 'ai-li-004',
                productId: 'prod-004',
                sku: 'FOLDERS-MANILA',
                productName: 'Manila Folders 100ct',
                quantityOrdered: 6,
                unitOfMeasure: 'Box',
                costPerUnit: 12.99,
                category: 'Office Supplies'
            }
        ]
    }
]

export function AutomatedReplenishmentView({ userRole, userId }: AutomatedReplenishmentViewProps) {
    const [orders, setOrders] = useKV<Order[]>('replenishment-orders', sampleReplenishmentOrders)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
    const [approvalType, setApprovalType] = useState<'approve' | 'reject'>('approve')

    const getFilteredOrders = () => {
        if (!orders) return []

        // Show only REPLENISHMENT orders with PENDING_FM_APPROVAL status
        return orders.filter(order =>
            order.orderType === 'REPLENISHMENT' &&
            order.status === 'PENDING_FM_APPROVAL'
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const handleApprove = (order: Order) => {
        setSelectedOrder(order)
        setApprovalType('approve')
        setApprovalDialogOpen(true)
    }

    const handleReject = (order: Order) => {
        setSelectedOrder(order)
        setApprovalType('reject')
        setApprovalDialogOpen(true)
    }

    const handleApprovalSubmit = async (reason?: string) => {
        if (!selectedOrder) return

        try {
            const isApproval = approvalType === 'approve'
            const newStatus = isApproval ? 'APPROVED_FOR_FULFILLMENT' : 'REJECTED'

            // Create audit entry
            const auditEntry: AuditEntry = {
                timestamp: new Date().toISOString(),
                actor: 'Facility Manager',
                action: isApproval ? 'ORDER_APPROVED' : 'ORDER_REJECTED',
                details: isApproval
                    ? 'AI replenishment order approved by FM for fulfillment'
                    : `AI replenishment order rejected by FM: ${reason}`,
                reasonCode: reason
            }

            // Update order
            const updatedOrder: Order = {
                ...selectedOrder,
                status: newStatus,
                auditTrail: [...(selectedOrder.auditTrail || []), auditEntry]
            }

            // Update orders array
            setOrders(currentOrders =>
                currentOrders?.map(order =>
                    order.orderId === selectedOrder.orderId ? updatedOrder : order
                ) || []
            )

            // Show success toast
            toast.success(
                `AI replenishment order ${isApproval ? 'approved' : 'rejected'}`,
                {
                    description: `Order #${selectedOrder.orderId.slice(-6)} has been ${isApproval ? 'approved for fulfillment' : 'rejected'}.`
                }
            )

            // Close dialog
            setApprovalDialogOpen(false)
            setSelectedOrder(null)

        } catch (error) {
            toast.error('Failed to process order', {
                description: 'Please try again or contact support.'
            })
        }
    }

    const generateMoreOrders = () => {
        // Simulate nightly AI run generating new replenishment orders
        const newOrders: Order[] = [
            {
                orderId: `ai-replen-${Date.now()}`,
                storeId: 'store-003',
                storeName: 'Santa Monica',
                orderType: 'REPLENISHMENT',
                status: 'PENDING_FM_APPROVAL',
                lineItemCount: 6,
                totalCost: 312.50,
                createdAt: new Date().toISOString(),
                createdByUserId: 'ai-agent',
                justification: 'Seasonal demand spike detected for Q4. Historical patterns suggest 25% increase in product consumption.',
                auditTrail: [
                    {
                        timestamp: new Date().toISOString(),
                        actor: 'AI Agent',
                        action: 'ORDER_CREATED',
                        details: 'Automated replenishment order generated from nightly AI analysis'
                    }
                ],
                lineItems: [
                    {
                        lineItemId: `ai-li-${Date.now()}-1`,
                        productId: 'prod-005',
                        sku: 'DISINFECT-16OZ',
                        productName: 'Disinfectant Spray 16oz',
                        quantityOrdered: 20,
                        unitOfMeasure: 'Case',
                        costPerUnit: 8.75,
                        category: 'Cleaning Supplies'
                    }
                ]
            }
        ]

        setOrders(currentOrders => [...(currentOrders || []), ...newOrders])
        toast.success('AI Analysis Complete', {
            description: `${newOrders.length} new replenishment order(s) generated for review.`
        })
    }

    const filteredOrders = getFilteredOrders()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Robot className="text-blue-600" />
                        Automated Replenishment
                    </h1>
                    <p className="text-muted-foreground">
                        Review and approve AI-generated replenishment orders
                    </p>
                </div>
                <Button onClick={generateMoreOrders} className="flex items-center gap-2">
                    <Sparkle size={16} />
                    Simulate Nightly AI Run
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                                <p className="text-2xl font-bold">{filteredOrders.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(filteredOrders.reduce((sum, order) => sum + (order.totalCost || 0), 0))}
                                </p>
                            </div>
                            <TrendUp className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Stores Affected</p>
                                <p className="text-2xl font-bold">
                                    {new Set(filteredOrders.map(order => order.storeId)).size}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <Robot size={48} className="mx-auto text-blue-600 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Pending Replenishment Orders</h3>
                                <p className="text-muted-foreground mb-4">
                                    All AI-generated replenishment orders have been processed.
                                </p>
                                <Button onClick={generateMoreOrders} className="flex items-center gap-2">
                                    <Sparkle size={16} />
                                    Simulate Nightly AI Run
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredOrders.map((order) => (
                        <Card key={order.orderId} className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold">
                                                Order #{order.orderId.slice(-6)}
                                            </h3>
                                            <Badge variant="outline" className="text-blue-700 border-blue-300">
                                                <Robot size={12} className="mr-1" />
                                                AI Generated
                                            </Badge>
                                            <Badge variant="secondary">Pending FM Approval</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            {order.storeName} • REPLENISHMENT
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Generated: {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold">
                                            {formatCurrency(order.totalCost || 0)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {order.lineItemCount} items
                                        </div>
                                    </div>
                                </div>

                                {/* AI Justification */}
                                {order.justification && (
                                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Robot size={16} className="text-blue-600" />
                                            <span className="font-medium text-blue-800 dark:text-blue-200">
                                                AI Analysis
                                            </span>
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            {order.justification}
                                        </p>
                                    </div>
                                )}

                                <Separator className="my-4" />

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Package size={16} className="mr-2" />
                                        View Details
                                    </Button>
                                    <EnhancedButton
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleReject(order)}
                                        className="flex-1"
                                    >
                                        <X size={16} className="mr-2" />
                                        Reject
                                    </EnhancedButton>
                                    <EnhancedButton
                                        variant="success"
                                        size="sm"
                                        onClick={() => handleApprove(order)}
                                        className="flex-1"
                                    >
                                        <CheckCircle size={16} className="mr-2" />
                                        Approve
                                    </EnhancedButton>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Approval Dialog */}
            {selectedOrder && (
                <ApprovalDialog
                    open={approvalDialogOpen}
                    onOpenChange={setApprovalDialogOpen}
                    title={approvalType === 'approve' ? 'Approve AI Replenishment Order' : 'Reject AI Replenishment Order'}
                    description={
                        approvalType === 'approve'
                            ? 'Approve this AI-generated replenishment order for fulfillment?'
                            : 'Reject this AI-generated replenishment order?'
                    }
                    itemName={`Order #${selectedOrder.orderId.slice(-6)}`}
                    itemDetails={{
                        'Store': selectedOrder.storeName,
                        'Type': selectedOrder.orderType,
                        'Items': selectedOrder.lineItemCount,
                        'Total': formatCurrency(selectedOrder.totalCost || 0),
                        'AI Justification': selectedOrder.justification
                    }}
                    approvalType={approvalType}
                    requiresReason={approvalType === 'reject'}
                    reasonLabel="Rejection Reason"
                    reasonPlaceholder="Please provide a reason for rejecting this AI-generated order..."
                    onConfirm={handleApprovalSubmit}
                />
            )}
        </div>
    )
}