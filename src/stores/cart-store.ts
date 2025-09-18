import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface CartItem {
    productId: string
    sku: string
    productName: string
    quantity: number
    unitOfMeasure: string
    isRestricted: boolean
    costPerUnit?: number
}

interface CartStore {
    items: CartItem[]
    isOpen: boolean

    // Actions
    addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    setIsOpen: (isOpen: boolean) => void

    // Computed values
    getTotalItems: () => number
    getTotalValue: () => number
    getRestrictedItems: () => CartItem[]
    hasRestrictedItems: () => boolean
}

export const useCartStore = create<CartStore>()(
    devtools(
        persist(
            (set, get) => ({
                items: [],
                isOpen: false,

                addItem: (product, quantity = 1) => {
                    set((state) => {
                        const existingItem = state.items.find(item => item.productId === product.productId)

                        if (existingItem) {
                            return {
                                items: state.items.map(item =>
                                    item.productId === product.productId
                                        ? { ...item, quantity: item.quantity + quantity }
                                        : item
                                )
                            }
                        }

                        return {
                            items: [...state.items, { ...product, quantity }]
                        }
                    })
                },

                removeItem: (productId) => {
                    set((state) => ({
                        items: state.items.filter(item => item.productId !== productId)
                    }))
                },

                updateQuantity: (productId, quantity) => {
                    if (quantity <= 0) {
                        get().removeItem(productId)
                        return
                    }

                    set((state) => ({
                        items: state.items.map(item =>
                            item.productId === productId
                                ? { ...item, quantity }
                                : item
                        )
                    }))
                },

                clearCart: () => {
                    set({ items: [] })
                },

                setIsOpen: (isOpen) => {
                    set({ isOpen })
                },

                getTotalItems: () => {
                    return get().items.reduce((total, item) => total + item.quantity, 0)
                },

                getTotalValue: () => {
                    return get().items.reduce((total, item) => {
                        const cost = item.costPerUnit || 0
                        return total + (cost * item.quantity)
                    }, 0)
                },

                getRestrictedItems: () => {
                    return get().items.filter(item => item.isRestricted)
                },

                hasRestrictedItems: () => {
                    return get().items.some(item => item.isRestricted)
                }
            }),
            {
                name: 'cart-storage',
                partialize: (state) => ({ items: state.items })
            }
        ),
        {
            name: 'cart-store'
        }
    )
)