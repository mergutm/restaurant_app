'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'
import { formatCurrency } from '@/lib/utils'
import type { Table } from '@/types'
import { Minus, Plus, Trash2, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

export default function PedidoPage({ params }: { params: { tableId: string } }) {
    const { tableId: _id } = params
    const { items, total, addItem, removeItem, updateQuantity, updateNotes, clearCart, setTableId } = useCart()
    const [table, setTable] = useState<Table | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        setTableId(_id)
        api.getTables().then(res => {
            const all: Table[] = res.data.data?.tables ?? res.data.data ?? []
            setTable(all.find(t => t._id === _id) ?? null)
        })
    }, [_id, setTableId])

    const handleConfirm = async () => {
        if (items.length === 0) return
        setIsSubmitting(true)
        setError('')
        try {
            await api.createOrder({
                tableId: _id,
                items: items.map(i => ({
                    productId: i.product._id,
                    quantity: i.quantity,
                    price: i.product.price,
                    subtotal: i.product.price * i.quantity,
                    notes: i.notes || undefined,
                })),
            })
            clearCart()
            router.push('/mis-pedidos')
        } catch {
            setError('No se pudo crear el pedido. Intenta de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
                <h2 className="text-lg font-bold text-gray-900">
                    Mesa #{table?.number ?? '...'}
                </h2>
                <p className="text-sm text-gray-500">{items.length} producto{items.length !== 1 ? 's' : ''} en el pedido</p>
            </div>

            {/* Empty state */}
            {items.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                    <ShoppingBag className="w-16 h-16 text-gray-200" />
                    <div>
                        <p className="font-semibold text-gray-700">Pedido vacío</p>
                        <p className="text-sm text-gray-400 mt-1">Agrega platillos desde el menú</p>
                    </div>
                    <Link
                        href="/menu"
                        className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium"
                    >
                        <UtensilsCrossed className="w-4 h-4" />
                        Ir al Menú
                    </Link>
                </div>
            )}

            {/* Item list */}
            {items.length > 0 && (
                <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
                    {items.map(item => (
                        <div key={item.product._id} className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900">{item.product.name}</p>
                                    <p className="text-orange-600 text-sm font-bold mt-0.5">
                                        {formatCurrency(item.product.price * item.quantity)}
                                    </p>
                                </div>
                                <button onClick={() => removeItem(item.product._id)} className="text-red-400 p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-1.5">
                                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="text-gray-600">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => addItem(item.product)} className="text-gray-600">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {formatCurrency(item.product.price)} c/u
                                </span>
                            </div>

                            {/* Notes */}
                            <input
                                value={item.notes}
                                onChange={e => updateNotes(item.product._id, e.target.value)}
                                placeholder="Nota especial (opcional)"
                                className="mt-2 w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
                <div className="bg-white border-t px-4 py-4 mb-16 space-y-3">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">Total</span>
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(total)}</span>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-2xl transition-colors text-base"
                    >
                        {isSubmitting ? 'Enviando pedido...' : '✓ Confirmar Pedido'}
                    </button>
                </div>
            )}
        </div>
    )
}
