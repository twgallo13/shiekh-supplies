
import { useMemo, useState } from 'react'
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
    needType?: string
    equivalentUnit?: string
    unitOfMeasure: string
    itemsPerUnit?: number
    imageUrl?: string
    isRestricted: boolean
    costPerUnit?: number
    bufferStockLevel?: number
    supplyDurationDays?: number
    vendorSkuMap?: Record<string, string>
    barcodeAliases?: string[]
    variants?: Product[]
}

interface ProductDetailsPageProps {
    productId: string
    onBackToCatalog: () => void
}

export const ProductDetailsPage = ({ productId, onBackToCatalog }: ProductDetailsPageProps) => {
    const [products] = useKV<Product[]>('products', [])
    const addItem = useCartStore((state) => state.addItem)
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

    const baseProduct = useMemo(() => {
        return products?.find((p) => p.productId === productId)
    }, [products, productId])

    // Find functional substitution candidates based on needType + equivalentUnit
    const functionalSubstitutes = useMemo(() => {
        if (!baseProduct?.needType || !baseProduct?.equivalentUnit) return []

        return (products || []).filter(p =>
            p.productId !== baseProduct.productId &&
            p.needType === baseProduct.needType &&
            p.equivalentUnit === baseProduct.equivalentUnit
        )
    }, [products, baseProduct])

    // Combine explicit variants with functional substitutes
    const allVariants = useMemo(() => {
        const variants = baseProduct?.variants || []
        const substitutes = functionalSubstitutes

        // Deduplicate by productId
        const seen = new Set(variants.map(v => v.productId))
        const uniqueSubstitutes = substitutes.filter(s => !seen.has(s.productId))

        return [...variants, ...uniqueSubstitutes]
    }, [baseProduct?.variants, functionalSubstitutes])

    // The currently displayed product (base or selected variant)
    const product = useMemo(() => {
        if (!baseProduct) return null
        if (!selectedVariantId) return baseProduct

        const variant = allVariants.find(v => v.productId === selectedVariantId)
        return variant || baseProduct
    }, [baseProduct, selectedVariantId, allVariants])

    if (!baseProduct || !product) {
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

                        {/* Variants & Substitutes */}
                        {allVariants.length > 0 && (
                            <div className="space-y-3">
                                <div className="text-sm text-muted-foreground">
                                    {baseProduct.variants?.length ? 'Variants' : 'Functional Substitutes'}
                                    {baseProduct.needType && baseProduct.equivalentUnit && (
                                        <span className="ml-2 text-xs">
                                            ({baseProduct.needType} • {baseProduct.equivalentUnit})
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {/* Current selection */}
                                    <Button
                                        variant={!selectedVariantId ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedVariantId(null)}
                                        className="justify-start text-left h-auto p-3"
                                    >
                                        <div className="flex flex-col items-start">
                                            <div className="font-medium">{baseProduct.productName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {baseProduct.sku} • {formatCurrency(baseProduct.costPerUnit) || 'Price not available'}
                                            </div>
                                        </div>
                                    </Button>

                                    {/* Variants/Substitutes */}
                                    {allVariants.map((variant) => (
                                        <Button
                                            key={variant.productId}
                                            variant={selectedVariantId === variant.productId ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedVariantId(variant.productId)}
                                            className="justify-start text-left h-auto p-3"
                                        >
                                            <div className="flex flex-col items-start">
                                                <div className="font-medium">{variant.productName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {variant.sku} • {formatCurrency(variant.costPerUnit) || 'Price not available'}
                                                </div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

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