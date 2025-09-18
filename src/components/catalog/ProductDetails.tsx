
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
    imageUrl?: string
    isRestricted: boolean
    costPerUnit: number
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

    return (
        <div>
            <Button onClick={onBackToCatalog} variant="outline" className="mb-4">
                &larr; Back to Catalog
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{product.productName}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className="mb-4 aspect-square w-full max-w-md rounded-lg object-cover"
                        />
                    </div>
                    <div className="space-y-4">
                        <p className="text-lg text-gray-600">{product.description}</p>
                        <div>
                            <Badge>{product.category}</Badge>
                        </div>
                        <p className="text-3xl font-bold">${product.costPerUnit.toFixed(2)}</p>
                        <p>
                            <span className="font-semibold">SKU:</span> {product.sku}
                        </p>

                        <div className="pt-4">
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