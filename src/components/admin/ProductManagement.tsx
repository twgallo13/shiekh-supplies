import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const productSchema = z.object({
    productId: z.string().optional(),
    sku: z.string().min(1, 'SKU is required'),
    productName: z.string().min(1, 'Product Name is required'),
    category: z.string().min(1, 'Category is required'),
    costPerUnit: z.preprocess((val) => Number(val), z.number().min(0, 'Cost must be >= 0')),
    isRestricted: z.boolean().optional(),
})

const sampleProducts = [
    {
        productId: 'prod-001',
        sku: 'SKU-001',
        productName: 'Paper Towels',
        category: 'Cleaning',
        costPerUnit: 2.99,
        isRestricted: false,
    },
    {
        productId: 'prod-002',
        sku: 'SKU-002',
        productName: 'Hand Soap',
        category: 'Cleaning',
        costPerUnit: 1.49,
        isRestricted: false,
    },
    {
        productId: 'prod-003',
        sku: 'SKU-003',
        productName: 'Gloves',
        category: 'Safety',
        costPerUnit: 5.99,
        isRestricted: true,
    },
]

export function ProductManagement() {
    const [productsRaw, setProducts] = useKV<any[]>('products', sampleProducts)
    const products = Array.isArray(productsRaw) ? productsRaw : (productsRaw ? [productsRaw] : [])
    const [showDialog, setShowDialog] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any | null>(null)

    const openAddDialog = () => {
        setEditingProduct(null)
        setShowDialog(true)
    }

    const openEditDialog = (product: any) => {
        setEditingProduct(product)
        setShowDialog(true)
    }

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: editingProduct || {
            sku: '',
            productName: '',
            category: '',
            costPerUnit: 0,
            isRestricted: false,
        }
    })

    const onSubmit = async (data: any) => {
        await new Promise(res => setTimeout(res, 800))
        if (editingProduct) {
            // Update existing
            setProducts(current => (Array.isArray(current) ? current : [])
                .map(p => p.productId === editingProduct.productId ? { ...editingProduct, ...data } : p))
            toast.success('Product updated successfully')
        } else {
            // Add new
            const newProduct = { ...data, productId: `prod-${Date.now()}` }
            setProducts(current => [...(Array.isArray(current) ? current : []), newProduct])
            toast.success('Product added successfully')
        }
        setShowDialog(false)
        reset()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Product Management</h1>
                <Button onClick={openAddDialog}>Add New Product</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Product Catalog</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Cost/Unit</TableHead>
                                <TableHead>Restricted</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(product => (
                                <TableRow key={product.productId}>
                                    <TableCell>{product.sku}</TableCell>
                                    <TableCell>{product.productName}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>${product.costPerUnit?.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Switch checked={!!product.isRestricted} disabled />
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline" onClick={() => openEditDialog(product)}>
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">SKU</label>
                            <Input {...register('sku')} />
                            {errors.sku?.message && <div className="text-xs text-red-500 mt-1">{String(errors.sku.message)}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Name</label>
                            <Input {...register('productName')} />
                            {errors.productName?.message && <div className="text-xs text-red-500 mt-1">{String(errors.productName.message)}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <Input {...register('category')} />
                            {errors.category?.message && <div className="text-xs text-red-500 mt-1">{String(errors.category.message)}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Cost per Unit</label>
                            <Input type="number" step="0.01" {...register('costPerUnit', { valueAsNumber: true })} />
                            {errors.costPerUnit?.message && <div className="text-xs text-red-500 mt-1">{String(errors.costPerUnit.message)}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={!!editingProduct?.isRestricted} onCheckedChange={val => setValue('isRestricted', val)} />
                            <span>Restricted Product</span>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {editingProduct ? 'Update Product' : 'Add Product'}
                            </Button>
                            <DialogClose asChild>
                                <Button variant="outline" type="button" onClick={() => setShowDialog(false)}>
                                    Cancel
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
