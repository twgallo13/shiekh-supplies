import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { UserRole } from '@/lib/auth'
import type { Order, LineItem } from '@/types/orders'
import { ShoppingCart, Package, CheckCircle, Truck, Flag } from '@phosphor-icons/react'

interface GoodsReceiptViewProps {
    userRole: UserRole
    userId: string
    onNavigateToReceiving?: (order: Order) => void
}

// Extended sample orders with line items for goods receipt
const sampleOrdersWithItems: Order[] = [
    {
        orderId: 'order-006',
        storeId: 'store-001',
        storeName: 'Downtown LA',
        orderType: 'REPLENISHMENT',
        status: 'IN_TRANSIT',
        lineItemCount: 3,
        totalCost: 287.50,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        createdByUserId: 'ai-agent',
        expectedDeliveryDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        lineItems: [
            {
                lineItemId: 'li-001',
                productId: 'prod-001',
                sku: 'GLASS-CLR-32OZ',
                productName: 'Glass Cleaner 32oz',
                quantityOrdered: 12,
                unitOfMeasure: 'Case',
                costPerUnit: 14.99,
                category: 'Cleaning Supplies'
            },
            {
                lineItemId: 'li-002',
                productId: 'prod-002',
                sku: 'PAPER-TOWEL-12PK',
                productName: 'Paper Towels 12-Pack',
                quantityOrdered: 6,
                unitOfMeasure: 'Case',
                costPerUnit: 28.50,
                category: 'Paper Products'
            },
            {
                lineItemId: 'li-003',
                productId: 'prod-004',
                sku: 'RECEIPT-PAPER',
                productName: 'Receipt Paper Rolls',
                quantityOrdered: 4,
                unitOfMeasure: 'Case',
                costPerUnit: 45.00,
                category: 'Paper Products'
            }
        ],
        auditTrail: [
            {
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                actor: 'ai-agent',
                action: 'ORDER_CREATED',
                details: 'Automated replenishment order'
            },
            {
                timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
                actor: 'system',
                action: 'STATUS_UPDATED',
                details: 'Status changed to APPROVED_FOR_FULFILLMENT'
            },
            {
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                actor: 'warehouse',
                action: 'SHIPPED',
                details: 'Order dispatched for delivery'
            }
        ]
    },
    {
        orderId: 'order-007',
        storeId: 'store-001',
        storeName: 'Downtown LA',
        orderType: 'AD_HOC',
        status: 'APPROVED_FOR_FULFILLMENT',
        lineItemCount: 1,
        totalCost: 899.99,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        createdByUserId: 'demo-sm-1',
        expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        justification: 'Replacement for damaged POS terminal - customer complaints about slow processing',
        lineItems: [
            {
                lineItemId: 'li-004',
                productId: 'prod-003',
                sku: 'POS-TERMINAL',
                productName: 'POS Terminal',
                quantityOrdered: 1,
                unitOfMeasure: 'Each',
                costPerUnit: 899.99,
                category: 'Equipment'
            }
        ],
        auditTrail: [
            {
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                actor: 'demo-sm-1',
                action: 'ORDER_CREATED',
                details: 'Store-initiated ad-hoc request'
            },
            {
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                actor: 'demo-dm-1',
                action: 'DM_APPROVED',
                details: 'District Manager approved restricted item request'
            },
            {
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                actor: 'demo-fm-1',
                action: 'FM_APPROVED',
                details: 'Facility Manager approved for fulfillment'
            }
        ]
    }
]

export function GoodsReceiptView({ userRole, userId, onNavigateToReceiving }: GoodsReceiptViewProps) {
    const [orders, setOrders] = useKV<Order[]>('goods-receipt-orders', sampleOrdersWithItems)

    const getFilteredOrders = () => {
        if (!orders) return []

        // Show orders that are ready for receiving or have variances to review
        return orders.filter(order =>
            (order.status === 'APPROVED_FOR_FULFILLMENT' ||
                order.status === 'IN_TRANSIT' ||
                order.status === 'RECEIVED_VARIANCE') &&
            (userRole === 'SM' ? order.storeId === 'store-001' : true) // Filter by store for SM
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_TRANSIT':
                return 'default'
            case 'APPROVED_FOR_FULFILLMENT':
                return 'secondary'
            case 'RECEIVED_VARIANCE':
                return 'destructive'
            default:
                return 'outline'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'IN_TRANSIT':
                return <Truck size={16} />
            case 'APPROVED_FOR_FULFILLMENT':
                return <CheckCircle size={16} />
            case 'RECEIVED_VARIANCE':
                return <Flag size={16} />
            default:
                return <Package size={16} />
        }
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

    const handleReceiveItems = (order: Order) => {
        if (onNavigateToReceiving) {
            onNavigateToReceiving(order)
        }
    }

    const filteredOrders = getFilteredOrders()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Goods Receipt</h1>
                <p className="text-muted-foreground">
                    Review and confirm delivery of orders ready for receiving
                </p>
            </div>

            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No orders ready for receiving</h3>
                            <p className="text-muted-foreground">
                                Orders will appear here when they are approved for fulfillment or in transit
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredOrders.map((order) => (
                        <Card key={order.orderId} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {getStatusIcon(order.status)}
                                            Order #{order.orderId.slice(-6)}
                                        </CardTitle>
                                        <CardDescription className="space-y-1">
                                            <div>{order.storeName} • {order.lineItemCount} items • {order.orderType}</div>
                                            {order.expectedDeliveryDate && (
                                                <div className="text-sm">
                                                    Expected: {formatDate(order.expectedDeliveryDate)}
                                                </div>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={getStatusColor(order.status)}>
                                        {order.status.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-3">
                                    {/* Order Summary */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Created: {formatDate(order.createdAt)}
                                        </span>
                                        {order.totalCost && (
                                            <span className="font-semibold">
                                                Total: {formatCurrency(order.totalCost)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Line Items Preview */}
                                    {order.lineItems && order.lineItems.length > 0 && (
                                        <div className="bg-muted/30 rounded-lg p-3">
                                            <h4 className="text-sm font-medium mb-2">Items to Receive:</h4>
                                            <div className="space-y-1">
                                                {order.lineItems.slice(0, 3).map((item) => (
                                                    <div key={item.lineItemId} className="flex justify-between text-sm">
                                                        <span className="truncate flex-1 mr-2">{item.productName}</span>
                                                        <span className="text-muted-foreground">
                                                            {item.quantityOrdered} {item.unitOfMeasure}
                                                        </span>
                                                    </div>
                                                ))}
                                                {order.lineItems.length > 3 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        +{order.lineItems.length - 3} more items
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <Package size={16} className="mr-2" />
                                            View Details
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleReceiveItems(order)}
                                            variant={order.status === 'RECEIVED_VARIANCE' ? 'destructive' : 'default'}
                                        >
                                            {order.status === 'RECEIVED_VARIANCE' ? (
                                                <>
                                                    <Flag size={16} className="mr-2" />
                                                    Review Variances
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={16} className="mr-2" />
                                                    Receive Items
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}