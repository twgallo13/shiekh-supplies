
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { useCartStore } from '@/stores/cart-store'

interface Product {
    productId: string
    sku: string
    productName: string
    description: string
    category: string
    unitOfMeasure: string
    itemsPerUnit?: number
    imageUrl?: string
    isRestricted: boolean
    costPerUnit?: number
    bufferStockLevel?: number
    supplyDurationDays?: number
    vendorSkuMap?: Record<string, string>
    barcodeAliases?: string[]
}

interface ProductDetailsPageProps {
    productId: string
    onBackToCatalog: () => void
}

export const ProductDetailsPage = ({ productId, onBackToCatalog }: ProductDetailsPageProps) => {
    const [products] = useKV<Product[]>('products', [])
    const addItem = useCartStore((state) => state.addItem)

    const product = useMemo(() => {
        return products?.find((p) => p.productId === productId)
    }, [products, productId])

    if (!product) {
        return (
            <div className="text-center">
                <p>Product not found.</p>
                <Button onClick={onBackToCatalog} variant="link">
                    Go back to catalog
                </Button>
            </div>
        )
    }

    const handleAddToCart = () => {
        addItem({
            productId: product.productId,
            sku: product.sku,
            productName: product.productName,
            unitOfMeasure: product.unitOfMeasure,
            isRestricted: product.isRestricted,
            costPerUnit: product.costPerUnit
        })
        toast.success(`${product.productName} added to cart.`)
    }

    const handleRequestApproval = () => {
        addItem({
            productId: product.productId,
            sku: product.sku,
            productName: product.productName,
            unitOfMeasure: product.unitOfMeasure,
            isRestricted: product.isRestricted,
            costPerUnit: product.costPerUnit
        })
        toast.info(`${product.productName} added to cart for approval.`)
    }

    const formatCurrency = (amount?: number) => {
        if (amount == null) return undefined
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }

    const price = formatCurrency(product.costPerUnit)
    const vendorEntries = Object.entries(product.vendorSkuMap ?? {})

    return (
        <div>
            <Button onClick={onBackToCatalog} variant="outline" className="mb-4">
                &larr; Back to Catalog
            </Button>
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl">{product.productName}</CardTitle>
                            <div className="mt-2 flex items-center gap-2">
                                <Badge>{product.category}</Badge>
                                {product.isRestricted && (
                                    <Badge variant="destructive">Restricted</Badge>
                                )}
                            </div>
                        </div>
                        {price && (
                            <div className="text-2xl font-bold">{price}</div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Gallery */}
                    <div>
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.productName}
                                className="mb-4 aspect-square w-full max-w-md rounded-lg object-cover"
                            />
                        ) : (
                            <div className="mb-4 aspect-square w-full max-w-md rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                No image available
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <p className="text-base text-muted-foreground">{product.description || 'No description provided.'}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="text-sm">
                                <div className="text-muted-foreground">Unit</div>
                                <div className="font-medium">
                                    {product.unitOfMeasure}
                                    {product.itemsPerUnit ? ` · ${product.itemsPerUnit}/unit` : ''}
                                </div>
                            </div>
                            <div className="text-sm">
                                <div className="text-muted-foreground">SKU</div>
                                <div className="font-medium">{product.sku}</div>
                            </div>
                            <div className="text-sm">
                                <div className="text-muted-foreground">Product ID</div>
                                <div className="font-medium">{product.productId}</div>
                            </div>
                            {typeof product.bufferStockLevel === 'number' && (
                                <div className="text-sm">
                                    <div className="text-muted-foreground">Buffer Stock Level</div>
                                    <div className="font-medium">{product.bufferStockLevel}</div>
                                </div>
                            )}
                            {typeof product.supplyDurationDays === 'number' && (
                                <div className="text-sm">
                                    <div className="text-muted-foreground">Supply Duration</div>
                                    <div className="font-medium">{product.supplyDurationDays} days</div>
                                </div>
                            )}
                        </div>

                        {/* Vendor + Barcodes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="text-sm">
                                <div className="text-muted-foreground">Vendor SKUs</div>
                                {vendorEntries.length > 0 ? (
                                    <div className="mt-1 space-y-1">
                                        {vendorEntries.slice(0, 3).map(([vendor, sku]) => (
                                            <div key={vendor} className="font-mono text-xs">{vendor}: {sku}</div>
                                        ))}
                                        {vendorEntries.length > 3 && (
                                            <div className="text-xs text-muted-foreground">+{vendorEntries.length - 3} more</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="font-medium">—</div>
                                )}
                            </div>
                            <div className="text-sm">
                                <div className="text-muted-foreground">Barcode Aliases</div>
                                {(product.barcodeAliases && product.barcodeAliases.length > 0) ? (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {product.barcodeAliases.slice(0, 6).map((code) => (
                                            <Badge key={code} variant="outline" className="font-mono text-[11px]">{code}</Badge>
                                        ))}
                                        {product.barcodeAliases.length > 6 && (
                                            <div className="text-xs text-muted-foreground">+{product.barcodeAliases.length - 6} more</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="font-medium">—</div>
                                )}
                            </div>
                        </div>

                        {/* Inventory stub */}
                        <div className="rounded-md border p-3 text-sm text-muted-foreground">
                            Availability data not connected
                        </div>

                        {/* CTAs */}
                        <div className="pt-2">
                            {product.isRestricted ? (
                                <Button size="lg" onClick={handleRequestApproval}>
                                    Request Approval
                                </Button>
                            ) : (
                                <Button size="lg" onClick={handleAddToCart}>
                                    Add to Cart
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}