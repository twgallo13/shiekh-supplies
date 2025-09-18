import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { UserRole, hasPermission } from '@/lib/auth'
import { useCartStore } from '@/stores/cart-store'
import { MagnifyingGlass, Package, ShoppingCart, Warning } from '@phosphor-icons/react'

interface CatalogProps {
  userRole: UserRole
}

interface Product {
  productId: string
  sku: string
  productName: string
  description: string
  category: string
  unitOfMeasure: string
  imageUrl?: string
  isRestricted: boolean
  costPerUnit?: number
}

const sampleProducts: Product[] = [
  {
    productId: 'prod-001',
    sku: 'GLASS-CLR-32OZ',
    productName: 'Glass Cleaner 32oz',
    description: 'Ammonia-free glass cleaner for streak-free cleaning',
    category: 'Cleaning Supplies',
    unitOfMeasure: 'Case',
    isRestricted: false,
    costPerUnit: 14.99
  },
  {
    productId: 'prod-002',
    sku: 'PAPER-TOWEL-12PK',
    productName: 'Paper Towels 12-Pack',
    description: 'Heavy-duty paper towels for commercial use',
    category: 'Paper Products',
    unitOfMeasure: 'Case',
    isRestricted: false,
    costPerUnit: 28.50
  },
  {
    productId: 'prod-003',
    sku: 'POS-TERMINAL',
    productName: 'POS Terminal',
    description: 'Point of sale terminal system',
    category: 'Equipment',
    unitOfMeasure: 'Each',
    isRestricted: true,
    costPerUnit: 899.99
  },
  {
    productId: 'prod-004',
    sku: 'RECEIPT-PAPER',
    productName: 'Receipt Paper Rolls',
    description: 'Thermal receipt paper, 80mm width',
    category: 'Paper Products',
    unitOfMeasure: 'Case',
    isRestricted: false,
    costPerUnit: 45.00
  }
]

export function Catalog({ userRole }: CatalogProps) {
  const [products, setProducts] = useKV<Product[]>('products', sampleProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { addItem, items: cartItems, getTotalItems, setIsOpen } = useCartStore()

  const categories = ['all', ...new Set(products?.map(p => p.category) || [])]

  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const addToCart = (productId: string) => {
    const product = products?.find(p => p.productId === productId)
    if (product) {
      addItem({
        productId: product.productId,
        sku: product.sku,
        productName: product.productName,
        unitOfMeasure: product.unitOfMeasure,
        isRestricted: product.isRestricted,
        costPerUnit: product.costPerUnit
      })
    }
  }

  const requestApproval = (productId: string) => {
    // For restricted items, add to cart and it will be handled in the order submission
    addToCart(productId)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const canViewCosts = hasPermission(userRole, 'canViewCosts')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <p className="text-muted-foreground">Browse and order supplies for your location</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>
      </div>

      {cartItems.length > 0 && (
        <Card className="border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={20} />
              Cart ({getTotalItems()} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {cartItems.length} product types selected
              </span>
              <Button onClick={() => setIsOpen(true)}>Review Cart</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.productId}
            className="cursor-pointer"
            onClick={e => {
              // Prevent navigation if a button is clicked
              if ((e.target as HTMLElement).closest('button')) return
              window.location.hash = `#/product/${product.productId}`
            }}
          >
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.productName}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </div>
                  {product.isRestricted && (
                    <Badge variant="destructive" className="ml-2">
                      <Warning size={12} className="mr-1" />
                      Restricted
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-mono">{product.sku}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unit:</span>
                    <span>{product.unitOfMeasure}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span>{product.category}</span>
                  </div>
                  {canViewCosts && product.costPerUnit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-semibold">{formatCurrency(product.costPerUnit)}</span>
                    </div>
                  )}
                </div>

                {hasPermission(userRole, 'canCreateOrders') && (
                  <div>
                    {product.isRestricted ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={e => {
                          e.stopPropagation()
                          requestApproval(product.productId)
                        }}
                      >
                        Request Approval
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={e => {
                          e.stopPropagation()
                          addToCart(product.productId)
                        }}
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filter
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}