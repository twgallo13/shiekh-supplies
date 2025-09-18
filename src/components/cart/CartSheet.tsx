import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCartStore, CartItem } from '@/stores/cart-store'
import { User } from '@/lib/auth'
import { toast } from 'sonner'
import {
    ShoppingCart,
    Trash,
    Minus,
    Plus,
    Warning,
    Package
} from '@phosphor-icons/react'

interface CartSheetProps {
    user: User
}

export function CartSheet({ user }: CartSheetProps) {
    const {
        items,
        isOpen,
        setIsOpen,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalValue,
        hasRestrictedItems,
        getRestrictedItems
    } = useCartStore()

    const [showJustificationDialog, setShowJustificationDialog] = useState(false)
    const [justification, setJustification] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        updateQuantity(productId, newQuantity)
    }

    const handleSubmitOrder = () => {
        if (items.length === 0) {
            toast.error('Your cart is empty')
            return
        }

        if (hasRestrictedItems()) {
            setShowJustificationDialog(true)
        } else {
            processOrder()
        }
    }

    const processOrder = async () => {
        setIsSubmitting(true)

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Generate order ID
            const orderId = `ORD-${Date.now().toString().slice(-6)}`

            // Create order object matching the PRD schema
            const order = {
                orderId,
                storeId: user.assignment.id,
                requestedBy: user.userId,
                orderDate: new Date().toISOString(),
                status: 'PENDING_DM_APPROVAL',
                items: items.map(item => ({
                    productId: item.productId,
                    sku: item.sku,
                    productName: item.productName,
                    requestedQuantity: item.quantity,
                    unitOfMeasure: item.unitOfMeasure,
                    costPerUnit: item.costPerUnit || 0
                })),
                totalValue: getTotalValue(),
                hasRestrictedItems: hasRestrictedItems(),
                justification: hasRestrictedItems() ? justification : undefined,
                submittedAt: new Date().toISOString()
            }

            // Log the order object as requested
            console.log('Order submitted:', order)

            // Clear cart and close dialogs
            clearCart()
            setIsOpen(false)
            setShowJustificationDialog(false)
            setJustification('')

            // Show success toast
            toast.success(`Order #${orderId} submitted for approval.`, {
                description: 'Your order has been sent to the District Manager for approval.'
            })

        } catch (error) {
            toast.error('Failed to submit order', {
                description: 'Please try again or contact support.'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleJustificationSubmit = () => {
        if (!justification.trim()) {
            toast.error('Justification is required for restricted items')
            return
        }

        setShowJustificationDialog(false)
        processOrder()
    }

    return (
        <>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent className="w-full sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <ShoppingCart size={20} />
                            Shopping Cart
                        </SheetTitle>
                        <SheetDescription>
                            Review your items and submit your order for approval.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-auto py-6">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Package size={48} className="text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                                <p className="text-muted-foreground">
                                    Add items from the catalog to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <CartItemRow
                                        key={item.productId}
                                        item={item}
                                        onQuantityChange={handleQuantityChange}
                                        onRemove={() => removeItem(item.productId)}
                                        formatCurrency={formatCurrency}
                                    />
                                ))}

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Total Items:</span>
                                        <span>{getTotalItems()}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                        <span>Total Value:</span>
                                        <span>{formatCurrency(getTotalValue())}</span>
                                    </div>

                                    {hasRestrictedItems() && (
                                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                                            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                                                <Warning size={16} />
                                                <span className="text-sm font-medium">
                                                    Restricted Items Detected
                                                </span>
                                            </div>
                                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                                This order contains restricted items and will require justification.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => clearCart()}
                                        className="flex-1"
                                    >
                                        Clear Cart
                                    </Button>
                                    <Button
                                        onClick={handleSubmitOrder}
                                        className="flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Order'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Justification Dialog */}
            <Dialog open={showJustificationDialog} onOpenChange={setShowJustificationDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Justification Required</DialogTitle>
                        <DialogDescription>
                            Your order contains restricted items. Please provide a justification for this request.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Restricted Items:</Label>
                            <div className="space-y-1">
                                {getRestrictedItems().map((item) => (
                                    <div key={item.productId} className="flex items-center gap-2 text-sm">
                                        <Warning size={14} className="text-amber-500" />
                                        <span>{item.productName} (Qty: {item.quantity})</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="justification">Justification *</Label>
                            <Textarea
                                id="justification"
                                placeholder="Please explain why these restricted items are needed..."
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowJustificationDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleJustificationSubmit}
                            disabled={!justification.trim() || isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

interface CartItemRowProps {
    item: CartItem
    onQuantityChange: (productId: string, quantity: number) => void
    onRemove: () => void
    formatCurrency: (amount: number) => string
}

function CartItemRow({ item, onQuantityChange, onRemove, formatCurrency }: CartItemRowProps) {
    return (
        <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{item.productName}</h4>
                    {item.isRestricted && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                            <Warning size={10} className="mr-1" />
                            Restricted
                        </Badge>
                    )}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>SKU: {item.sku}</div>
                    <div>Unit: {item.unitOfMeasure}</div>
                    {item.costPerUnit && (
                        <div>Price: {formatCurrency(item.costPerUnit)} each</div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-8 w-8 p-0"
                >
                    <Minus size={12} />
                </Button>

                <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                    className="h-8 w-16 text-center text-sm"
                />

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
                    className="h-8 w-8 p-0"
                >
                    <Plus size={12} />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                    <Trash size={14} />
                </Button>
            </div>
        </div>
    )
}