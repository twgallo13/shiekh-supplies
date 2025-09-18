import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Warning, ArrowLeft } from '@phosphor-icons/react'
import { useCartStore } from '@/stores/cart-store'
import { useEffect, useState } from 'react'

interface ProductDetailsProps {
    productId: string
    userRole: string
}

export function ProductDetails({ productId, userRole }: ProductDetailsProps) {
    const [products] = useKV<any[]>('products', [])
    const product = products?.find(p => p.productId === productId)
    const { addItem, setIsOpen } = useCartStore()
    const [added, setAdded] = useState(false)

    if (!product) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
                    <p className="text-muted-foreground">The product you are looking for does not exist.</p>
                    <Button variant="outline" onClick={() => window.location.hash = '#/catalog'}>
                        <ArrowLeft className="mr-2" /> Back to Catalog
                    </Button>
                </CardContent>
            </Card>
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
        setAdded(true)
        setTimeout(() => setAdded(false), 1200)
    }

    const handleRequestApproval = () => {
        handleAddToCart()
        setIsOpen(true)
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => window.location.hash = '#/catalog'} className="mb-2">
                <ArrowLeft className="mr-2" /> Back to Catalog
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{product.productName}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div>
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.productName} className="rounded-lg w-full max-w-xs object-cover" />
                            ) : (
                                <div className="bg-muted rounded-lg w-full max-w-xs h-48 flex items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-2 items-center">
                                <span className="font-semibold">SKU:</span>
                                <span className="font-mono">{product.sku}</span>
                                {product.isRestricted && (
                                    <Badge variant="destructive" className="ml-2">
                                        <Warning size={12} className="mr-1" /> Restricted
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <span className="font-semibold">Category:</span> {product.category}
                            </div>
                            <div>
                                <span className="font-semibold">Unit:</span> {product.unitOfMeasure}
                            </div>
                            <div>
                                <span className="font-semibold">Cost per Unit:</span> ${product.costPerUnit?.toFixed(2)}
                            </div>
                            <div>
                                <span className="font-semibold">Description:</span> {product.description}
                            </div>
                            <div className="mt-4">
                                {product.isRestricted ? (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleRequestApproval}
                                        disabled={added}
                                    >
                                        Request Approval
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full"
                                        onClick={handleAddToCart}
                                        disabled={added}
                                    >
                                        <ShoppingCart size={16} className="mr-2" />
                                        {added ? 'Added!' : 'Add to Cart'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
