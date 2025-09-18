import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Order, AuditEntry, LineItem } from '@/types/orders'
import { toast } from 'sonner'
import { ArrowLeft, Flag, Warning, Package, CheckCircle, X, Camera, Calendar, User } from '@phosphor-icons/react'

interface VarianceResolutionPageProps {
    order: Order
    onGoBack: () => void
    onOrderResolved: (updatedOrder: Order) => void
}

export function VarianceResolutionPage({ order, onGoBack, onOrderResolved }: VarianceResolutionPageProps) {
    const [orders, setOrders] = useKV<Order[]>('variance-resolution-orders', [])
    const [isProcessing, setIsProcessing] = useState(false)

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

    const getItemsWithVariances = (): LineItem[] => {
        return order.lineItems?.filter(item => item.variance) || []
    }

    const getVarianceTypeIcon = (type: string) => {
        switch (type) {
            case 'DAMAGED':
                return <Warning size={16} className="text-orange-600" />
            case 'SHORT_SHIP':
                return <Package size={16} className="text-blue-600" />
            case 'WRONG_ITEM':
                return <Flag size={16} className="text-red-600" />
            default:
                return <Flag size={16} className="text-gray-600" />
        }
    }

    const getVarianceTypeLabel = (type: string) => {
        switch (type) {
            case 'DAMAGED':
                return 'Damaged Items'
            case 'SHORT_SHIP':
                return 'Short Shipment'
            case 'WRONG_ITEM':
                return 'Wrong Item Received'
            default:
                return type
        }
    }

    const getVarianceTypeColor = (type: string) => {
        switch (type) {
            case 'DAMAGED':
                return 'destructive'
            case 'SHORT_SHIP':
                return 'default'
            case 'WRONG_ITEM':
                return 'secondary'
            default:
                return 'outline'
        }
    }

    const handleAcceptVariance = async () => {
        setIsProcessing(true)

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Create audit entry for acceptance
            const acceptanceEntry: AuditEntry = {
                timestamp: new Date().toISOString(),
                actor: 'Facility Manager',
                action: 'VARIANCE_ACCEPTED',
                details: 'Variance accepted by FM. Order closed with financial reconciliation triggered.'
            }

            // Update order status to CLOSED
            const updatedOrder: Order = {
                ...order,
                status: 'CLOSED',
                auditTrail: [...(order.auditTrail || []), acceptanceEntry]
            }

            // Update orders in storage
            setOrders(currentOrders =>
                currentOrders?.map(o =>
                    o.orderId === order.orderId ? updatedOrder : o
                ) || []
            )

            // Show success notification
            toast.success(`Variance for order #${order.orderId.slice(-6)} accepted.`, {
                description: 'Order is now closed and financial reconciliation has been triggered.'
            })

            // Notify parent component
            onOrderResolved(updatedOrder)

            // Navigate back after a short delay
            setTimeout(() => {
                onGoBack()
            }, 2000)

        } catch (error) {
            toast.error('Failed to accept variance', {
                description: 'Please try again or contact support.'
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDisputeVariance = async () => {
        setIsProcessing(true)

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Create audit entry for dispute
            const disputeEntry: AuditEntry = {
                timestamp: new Date().toISOString(),
                actor: 'Facility Manager',
                action: 'VARIANCE_DISPUTED',
                details: 'Variance disputed by FM. Order closed pending offline vendor resolution process.'
            }

            // Update order status to CLOSED (disputed orders also close but trigger different workflow)
            const updatedOrder: Order = {
                ...order,
                status: 'CLOSED',
                auditTrail: [...(order.auditTrail || []), disputeEntry]
            }

            // Update orders in storage
            setOrders(currentOrders =>
                currentOrders?.map(o =>
                    o.orderId === order.orderId ? updatedOrder : o
                ) || []
            )

            // Show success notification
            toast.success(`Variance for order #${order.orderId.slice(-6)} disputed.`, {
                description: 'Order closed pending offline vendor process. Support has been notified.'
            })

            // Notify parent component
            onOrderResolved(updatedOrder)

            // Navigate back after a short delay
            setTimeout(() => {
                onGoBack()
            }, 2000)

        } catch (error) {
            toast.error('Failed to dispute variance', {
                description: 'Please try again or contact support.'
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const varianceItems = getItemsWithVariances()
    const totalVarianceValue = varianceItems.reduce((total, item) => {
        const lostValue = item.variance?.type === 'SHORT_SHIP'
            ? (item.quantityOrdered - (item.quantityReceived || 0)) * item.costPerUnit
            : item.quantityReceived ? item.quantityReceived * item.costPerUnit : 0
        return total + lostValue
    }, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onGoBack}>
                    <ArrowLeft size={16} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Variance Resolution</h1>
                    <p className="text-muted-foreground">
                        Order #{order.orderId.slice(-6)} • {order.storeName}
                    </p>
                </div>
            </div>

            {/* Order Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Flag className="text-red-600" />
                        Order Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <span className="text-muted-foreground text-sm">Order Type</span>
                            <div className="font-medium">{order.orderType}</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-sm">Total Value</span>
                            <div className="font-medium">{formatCurrency(order.totalCost || 0)}</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-sm">Line Items</span>
                            <div className="font-medium">{order.lineItemCount}</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-sm">Status</span>
                            <Badge variant="destructive">Variance Reported</Badge>
                        </div>
                    </div>
                    {order.expectedDeliveryDate && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar size={14} />
                                Expected Delivery: {formatDate(order.expectedDeliveryDate)}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Variance Details */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Reported Variances</h2>

                {varianceItems.map((item) => (
                    <Card key={item.lineItemId} className="border-l-4 border-l-red-500">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {/* Item Information */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">{item.productName}</h3>
                                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                            <span>Ordered: {item.quantityOrdered}</span>
                                            <span>Received: {item.quantityReceived || 0}</span>
                                            <span>Unit Cost: {formatCurrency(item.costPerUnit)}</span>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={getVarianceTypeColor(item.variance!.type) as any}
                                        className="flex items-center gap-1"
                                    >
                                        {getVarianceTypeIcon(item.variance!.type)}
                                        {getVarianceTypeLabel(item.variance!.type)}
                                    </Badge>
                                </div>

                                <Separator />

                                {/* Variance Details */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Store Manager Notes:</label>
                                        <p className="mt-1 text-sm bg-muted/50 p-3 rounded-md">
                                            {item.variance!.notes}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User size={14} />
                                            Reported: {formatDate(item.variance!.reportedAt)}
                                        </div>

                                        {item.variance!.photoUrl && (
                                            <Button variant="outline" size="sm">
                                                <Camera size={14} className="mr-2" />
                                                View Photo Evidence
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Financial Impact */}
            <Card>
                <CardHeader>
                    <CardTitle>Financial Impact</CardTitle>
                    <CardDescription>
                        Summary of potential financial impact from reported variances
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-muted-foreground text-sm">Affected Items</span>
                            <div className="text-2xl font-bold">{varianceItems.length}</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-sm">Estimated Impact</span>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(totalVarianceValue)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resolution Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Resolution Actions</CardTitle>
                    <CardDescription>
                        Choose how to resolve this variance. Both actions will close the order.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold text-green-700 mb-2">Accept Variance</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Accept the reported variance as valid. This will trigger financial reconciliation
                                    and close the order as resolved.
                                </p>
                                <EnhancedButton
                                    variant="success"
                                    onClick={handleAcceptVariance}
                                    loading={isProcessing}
                                    className="w-full"
                                >
                                    <CheckCircle size={16} className="mr-2" />
                                    Accept Variance
                                </EnhancedButton>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold text-red-700 mb-2">Dispute Variance</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Dispute the reported variance. This will close the order and initiate
                                    offline vendor resolution process.
                                </p>
                                <EnhancedButton
                                    variant="destructive"
                                    onClick={handleDisputeVariance}
                                    loading={isProcessing}
                                    className="w-full"
                                >
                                    <X size={16} className="mr-2" />
                                    Dispute Variance
                                </EnhancedButton>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Button variant="outline" onClick={onGoBack} className="w-full">
                                Cancel and Return to Queue
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}