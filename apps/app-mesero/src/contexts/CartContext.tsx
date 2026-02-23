'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import type { CartItem, Product } from '@/types'

interface CartContextType {
    items: CartItem[]
    tableId: string | null
    setTableId: (id: string) => void
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, qty: number) => void
    updateNotes: (productId: string, notes: string) => void
    clearCart: () => void
    total: number
    itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [tableId, setTableId] = useState<string | null>(null)

    const addItem = useCallback((product: Product) => {
        setItems(prev => {
            const existing = prev.find(i => i.product._id === product._id)
            if (existing) {
                return prev.map(i =>
                    i.product._id === product._id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            }
            return [...prev, { product, quantity: 1, notes: '' }]
        })
    }, [])

    const removeItem = useCallback((productId: string) => {
        setItems(prev => prev.filter(i => i.product._id !== productId))
    }, [])

    const updateQuantity = useCallback((productId: string, qty: number) => {
        if (qty <= 0) {
            removeItem(productId)
            return
        }
        setItems(prev =>
            prev.map(i => i.product._id === productId ? { ...i, quantity: qty } : i)
        )
    }, [removeItem])

    const updateNotes = useCallback((productId: string, notes: string) => {
        setItems(prev =>
            prev.map(i => i.product._id === productId ? { ...i, notes } : i)
        )
    }, [])

    const clearCart = useCallback(() => setItems([]), [])

    const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

    return (
        <CartContext.Provider value={{
            items, tableId, setTableId,
            addItem, removeItem, updateQuantity, updateNotes,
            clearCart, total, itemCount,
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used inside CartProvider')
    return ctx
}
