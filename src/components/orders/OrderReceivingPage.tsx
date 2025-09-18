import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Order, LineItem, AuditEntry, VarianceType } from '@/types/orders'
import { VarianceReportDialog } from './VarianceReportDialog'
import { toast } from 'sonner'
import { ArrowLeft, Package, CheckCircle, Warning, Flag } from '@phosphor-icons/react'

interface OrderReceivingPageProps {
    order: Order
    onGoBack: () => void
    onOrderCompleted: (updatedOrder: Order) => void
}

interface ReceivingLineItem extends LineItem {
    quantityReceived: number
    hasVariance: boolean
}

export function OrderReceivingPage({ order, onGoBack, onOrderCompleted }: OrderReceivingPageProps) {
    const [orders, setOrders] = useKV<Order[]>('goods-receipt-orders', [])
    const [receivingItems, setReceivingItems] = useState<ReceivingLineItem[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [varianceDialogOpen, setVarianceDialogOpen] = useState(false)
    const [selectedLineItem, setSelectedLineItem] = useState<LineItem | null>(null)

    useEffect(() => {
        // Initialize receiving items with default quantities
        if (order.lineItems) {
            const initItems: ReceivingLineItem[] = order.lineItems.map(item => ({
                ...item,
                quantityReceived: item.quantityOrdered, // Default to ordered quantity
                hasVariance: false
            }))
            setReceivingItems(initItems)
        }
    }, [order])

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

    const updateQuantityReceived = (lineItemId: string, quantity: number) => {
        setReceivingItems(items =>
            items.map(item => {
                if (item.lineItemId === lineItemId) {
                    const hasVariance = quantity !== item.quantityOrdered
                    return {
                        ...item,
                        quantityReceived: Math.max(0, quantity), // Prevent negative quantities
                        hasVariance
                    }
                }
                return item
            })
        )
    }

    const getTotalReceivedValue = () => {
        return receivingItems.reduce((total, item) => {
            return total + (item.quantityReceived * item.costPerUnit)
        }, 0)
    }

    const getTotalVariances = () => {
        return receivingItems.filter(item => item.hasVariance).length
    }

    const hasAnyVariances = () => {
        return receivingItems.some(item => item.hasVariance || item.variance)
    }

    const handleReportVariance = (lineItem: LineItem) => {
        setSelectedLineItem(lineItem)
        setVarianceDialogOpen(true)
    }

    const handleSubmitVariance = async (lineItemId: string, varianceType: VarianceType, notes: string, photoUrl?: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Update the line item with variance information
        setReceivingItems(items =>
            items.map(item => {
                if (item.lineItemId === lineItemId) {
                    return {
                        ...item,
                        variance: {
                            type: varianceType,
                            notes,
                            photoUrl,
                            reportedAt: new Date().toISOString(),
                            reportedBy: 'current-user-id' // In real app, get from auth context
                        },
                        hasVariance: true
                    }
                }
                return item
            })
        )

        // Update the order status to RECEIVED_VARIANCE and add audit entry
        const varianceEntry: AuditEntry = {
            timestamp: new Date().toISOString(),
            actor: 'Store Manager', // In real app, get from auth context
            action: 'VARIANCE_REPORTED',
            details: `${varianceType} reported for ${selectedLineItem?.productName}: ${notes}`
        }

        const updatedOrder: Order = {
            ...order,
            status: 'RECEIVED_VARIANCE',
            lineItems: receivingItems.map(item =>
                item.lineItemId === lineItemId
                    ? {
                        ...item,
                        variance: {
                            type: varianceType,
                            notes,
                            photoUrl,
                            reportedAt: new Date().toISOString(),
                            reportedBy: 'current-user-id'
                        }
                    }
                    : item
            ),
            auditTrail: [...(order.auditTrail || []), varianceEntry]
        }

        // Update orders in storage
        setOrders(currentOrders =>
            currentOrders?.map(o =>
                o.orderId === order.orderId ? updatedOrder : o
            ) || []
        )
    }

    const handleConfirmDelivery = async () => {
        setIsProcessing(true)

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Create audit entry for the receipt
            const receiptEntry: AuditEntry = {
                timestamp: new Date().toISOString(),
                actor: 'demo-sm-1', // Would be current user ID
                action: 'DELIVERY_CONFIRMED',
                details: hasAnyVariances()
                    ? `Received with ${getTotalVariances()} variance(s)`
                    : 'Full delivery received as ordered'
            }

            // Update order with received quantities and new status
            const updatedOrder: Order = {
                ...order,
                status: hasAnyVariances() ? 'RECEIVED_VARIANCE' : 'RECEIVED_COMPLETE',
                lineItems: receivingItems.map(item => ({
                    ...item,
                    quantityReceived: item.quantityReceived
                })),
                auditTrail: [...(order.auditTrail || []), receiptEntry]
            }

            // Update orders in storage
            setOrders(currentOrders =>
                currentOrders?.map(o =>
                    o.orderId === order.orderId ? updatedOrder : o
                ) || []
            )

            // Show success notification
            const statusMessage = hasAnyVariances()
                ? 'received with variances'
                : 'marked as received'

            toast.success(`Order #${order.orderId.slice(-6)} has been ${statusMessage}.`, {
                description: hasAnyVariances()
                    ? 'Variances have been recorded and will require review.'
                    : 'All items received as ordered.'
            })

            // Notify parent component
            onOrderCompleted(updatedOrder)

            // Navigate back after a short delay
            setTimeout(() => {
                onGoBack()
            }, 2000)

        } catch (error) {
            toast.error('Failed to confirm delivery', {
                description: 'Please try again or contact support.'
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_TRANSIT':
                return 'default'
            case 'APPROVED_FOR_FULFILLMENT':
                return 'secondary'
            default:
                return 'outline'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={onGoBack}>
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Goods Receipt
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Receive Order #{order.orderId.slice(-6)}</h1>
                    <p className="text-muted-foreground">
                        Confirm quantities received for {order.storeName}
                    </p>
                </div>
                <Badge variant={getStatusColor(order.status)}>
                    {order.status.replace(/_/g, ' ')}
                </Badge>
            </div>

            {/* Order Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package size={20} />
                        Order Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Order Type:</span>
                            <div className="font-medium">{order.orderType}</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Created:</span>
                            <div className="font-medium">{formatDate(order.createdAt)}</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Total Items:</span>
                            <div className="font-medium">{order.lineItemCount}</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Order Value:</span>
                            <div className="font-medium">
                                {order.totalCost ? formatCurrency(order.totalCost) : 'N/A'}
                            </div>
                        </div>
                    </div>
                    {order.expectedDeliveryDate && (
                        <div className="mt-4 pt-4 border-t">
                            <span className="text-muted-foreground text-sm">Expected Delivery:</span>
                            <div className="font-medium">{formatDate(order.expectedDeliveryDate)}</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Receiving Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Items to Receive</CardTitle>
                    <CardDescription>
                        Update the quantity received for each item. Items with variances will be flagged for review.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-center">Ordered</TableHead>
                                <TableHead className="text-center">Received</TableHead>
                                <TableHead className="text-right">Unit Cost</TableHead>
                                <TableHead className="text-right">Line Total</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receivingItems.map((item) => (
                                <TableRow key={item.lineItemId}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{item.productName}</div>
                                            <div className="text-sm text-muted-foreground">{item.category}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                                    <TableCell className="text-center">
                                        {item.quantityOrdered} {item.unitOfMeasure}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={item.quantityReceived}
                                            onChange={(e) => updateQuantityReceived(
                                                item.lineItemId,
                                                parseInt(e.target.value) || 0
                                            )}
                                            className="w-20 text-center"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(item.costPerUnit)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(item.quantityReceived * item.costPerUnit)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {item.variance ? (
                                            <Badge variant="destructive" className="text-xs">
                                                <Warning size={10} className="mr-1" />
                                                {item.variance.type.replace('_', ' ')}
                                            </Badge>
                                        ) : item.hasVariance ? (
                                            <Badge variant="destructive" className="text-xs">
                                                <Warning size={10} className="mr-1" />
                                                Variance
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-xs">
                                                <CheckCircle size={10} className="mr-1" />
                                                Match
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {!item.variance && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReportVariance(item)}
                                                className="text-xs"
                                            >
                                                <Flag size={12} className="mr-1" />
                                                Report Variance
                                            </Button>
                                        )}
                                        {item.variance && (
                                            <Badge variant="outline" className="text-xs">
                                                Reported
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Summary and Confirmation */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Receiving Summary</h3>
                            <p className="text-sm text-muted-foreground">
                                Review the totals before confirming delivery
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">
                                {formatCurrency(getTotalReceivedValue())}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total Received Value
                            </div>
                        </div>
                    </div>

                    {hasAnyVariances() && (
                        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-2">
                                <Warning size={16} />
                                <span className="font-medium">Variances Detected</span>
                            </div>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                {getTotalVariances()} item(s) have quantity variances. These will be flagged for review.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onGoBack} className="flex-1">
                            Cancel
                        </Button>
                        <EnhancedButton
                            variant="primary"
                            onClick={handleConfirmDelivery}
                            loading={isProcessing}
                            className="flex-1"
                        >
                            <CheckCircle size={16} className="mr-2" />
                            Confirm Delivery
                        </EnhancedButton>
                    </div>
                </CardContent>
            </Card>

            {/* Variance Report Dialog */}
            {selectedLineItem && (
                <VarianceReportDialog
                    open={varianceDialogOpen}
                    onOpenChange={setVarianceDialogOpen}
                    lineItem={selectedLineItem}
                    onSubmitVariance={handleSubmitVariance}
                />
            )}
        </div>
    )
}