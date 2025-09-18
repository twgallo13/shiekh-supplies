import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/lib/auth'
import type { Order } from '@/types/orders'
import { Flag, Warning, Package, CheckCircle, Clock } from '@phosphor-icons/react'

interface VarianceResolutionViewProps {
    userRole: UserRole
    userId: string
    onNavigateToResolution?: (order: Order) => void
}

// Sample orders with RECEIVED_VARIANCE status for testing
const sampleVarianceOrders: Order[] = [
    {
        orderId: 'order-variance-001',
        storeId: 'store-001',
        storeName: 'Downtown LA',
        orderType: 'REPLENISHMENT',
        status: 'RECEIVED_VARIANCE',
        lineItemCount: 3,
        totalCost: 287.50,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdByUserId: 'sm-sarah-001',
        expectedDeliveryDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        auditTrail: [
            {
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                actor: 'Store Manager',
                action: 'VARIANCE_REPORTED',
                details: 'DAMAGED reported for Glass Cleaner 32oz: Corner of packaging crushed during shipping'
            }
        ],
        lineItems: [
            {
                lineItemId: 'li-var-001',
                productId: 'prod-001',
                sku: 'GLASS-CLR-32OZ',
                productName: 'Glass Cleaner 32oz',
                quantityOrdered: 12,
                quantityReceived: 12,
                unitOfMeasure: 'Case',
                costPerUnit: 14.99,
                category: 'Cleaning Supplies',
                variance: {
                    type: 'DAMAGED',
                    notes: 'Corner of packaging crushed during shipping',
                    photoUrl: 'https://storage.example.com/variance-photos/damaged-001.jpg',
                    reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                    reportedBy: 'sm-sarah-001'
                }
            },
            {
                lineItemId: 'li-var-002',
                productId: 'prod-002',
                sku: 'PAPER-TOWEL-12PK',
                productName: 'Paper Towels 12-Pack',
                quantityOrdered: 6,
                quantityReceived: 6,
                unitOfMeasure: 'Case',
                costPerUnit: 28.50,
                category: 'Paper Products'
            },
            {
                lineItemId: 'li-var-003',
                productId: 'prod-003',
                sku: 'DISINFECT-16OZ',
                productName: 'Disinfectant Spray 16oz',
                quantityOrdered: 24,
                quantityReceived: 24,
                unitOfMeasure: 'Case',
                costPerUnit: 8.75,
                category: 'Cleaning Supplies'
            }
        ]
    },
    {
        orderId: 'order-variance-002',
        storeId: 'store-002',
        storeName: 'Beverly Hills',
        orderType: 'AD_HOC',
        status: 'RECEIVED_VARIANCE',
        lineItemCount: 2,
        totalCost: 156.00,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdByUserId: 'sm-mike-002',
        expectedDeliveryDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        auditTrail: [
            {
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                actor: 'Store Manager',
                action: 'VARIANCE_REPORTED',
                details: 'SHORT_SHIP reported for Office Supplies Kit: Received only 8 units instead of 12'
            }
        ],
        lineItems: [
            {
                lineItemId: 'li-var-004',
                productId: 'prod-004',
                sku: 'OFFICE-KIT-STD',
                productName: 'Office Supplies Kit',
                quantityOrdered: 12,
                quantityReceived: 8,
                unitOfMeasure: 'Kit',
                costPerUnit: 15.50,
                category: 'Office Supplies',
                variance: {
                    type: 'SHORT_SHIP',
                    notes: 'Received only 8 units instead of 12. Missing 4 kits from the shipment.',
                    photoUrl: 'https://storage.example.com/variance-photos/short-ship-001.jpg',
                    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    reportedBy: 'sm-mike-002'
                }
            },
            {
                lineItemId: 'li-var-005',
                productId: 'prod-005',
                sku: 'FOLDERS-MANILA',
                productName: 'Manila Folders 100ct',
                quantityOrdered: 5,
                quantityReceived: 5,
                unitOfMeasure: 'Box',
                costPerUnit: 12.99,
                category: 'Office Supplies'
            }
        ]
    }
]

export function VarianceResolutionView({ userRole, userId, onNavigateToResolution }: VarianceResolutionViewProps) {
    const [orders, setOrders] = useKV<Order[]>('variance-resolution-orders', sampleVarianceOrders)

    const getFilteredOrders = () => {
        if (!orders) return []

        // Only show orders with RECEIVED_VARIANCE status
        return orders.filter(order => order.status === 'RECEIVED_VARIANCE')
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

    const getVarianceCount = (order: Order) => {
        if (!order.lineItems) return 0
        return order.lineItems.filter(item => item.variance).length
    }

    const getVarianceTypes = (order: Order) => {
        if (!order.lineItems) return []
        const types = order.lineItems
            .filter(item => item.variance)
            .map(item => item.variance!.type)
        return [...new Set(types)] // Remove duplicates
    }

    const handleResolveVariance = (order: Order) => {
        if (onNavigateToResolution) {
            onNavigateToResolution(order)
        }
    }

    const getVarianceTypeIcon = (type: string) => {
        switch (type) {
            case 'DAMAGED':
                return <Warning size={14} className="text-orange-600" />
            case 'SHORT_SHIP':
                return <Package size={14} className="text-blue-600" />
            case 'WRONG_ITEM':
                return <Flag size={14} className="text-red-600" />
            default:
                return <Flag size={14} className="text-gray-600" />
        }
    }

    const getVarianceTypeLabel = (type: string) => {
        switch (type) {
            case 'DAMAGED':
                return 'Damaged'
            case 'SHORT_SHIP':
                return 'Short Ship'
            case 'WRONG_ITEM':
                return 'Wrong Item'
            default:
                return type
        }
    }

    const filteredOrders = getFilteredOrders()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Variance Resolution</h1>
                <p className="text-muted-foreground">
                    Review and resolve order variances reported by Store Managers
                </p>
            </div>

            <div className="grid gap-4">
                {filteredOrders.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Variances to Resolve</h3>
                                <p className="text-muted-foreground">
                                    All order variances have been resolved.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredOrders.map((order) => (
                        <Card key={order.orderId} className="border-l-4 border-l-orange-500">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold">
                                                Order #{order.orderId.slice(-6)}
                                            </h3>
                                            <Badge variant="destructive" className="text-xs">
                                                <Flag size={12} className="mr-1" />
                                                Variance Reported
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            {order.storeName} • {order.orderType}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Reported: {formatDate(order.auditTrail?.[order.auditTrail.length - 1]?.timestamp || order.createdAt)}
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

                                {/* Variance Summary */}
                                <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Flag size={16} className="text-orange-600" />
                                        <span className="font-medium text-orange-800 dark:text-orange-200">
                                            {getVarianceCount(order)} Variance(s) Reported
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {getVarianceTypes(order).map((type) => (
                                            <Badge
                                                key={type}
                                                variant="outline"
                                                className="text-xs border-orange-300 text-orange-700 dark:text-orange-300"
                                            >
                                                {getVarianceTypeIcon(type)}
                                                <span className="ml-1">{getVarianceTypeLabel(type)}</span>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Priority indicator */}
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock size={14} className="text-amber-600" />
                                    <span className="text-xs text-amber-700 dark:text-amber-400">
                                        Awaiting FM resolution
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Package size={16} className="mr-2" />
                                        View Details
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleResolveVariance(order)}
                                        variant="destructive"
                                    >
                                        <Flag size={16} className="mr-2" />
                                        Resolve Variance
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}