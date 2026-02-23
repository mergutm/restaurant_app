'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { Order } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { io, Socket } from 'socket.io-client'
import { WS_URL } from '@/lib/constants'
import { ClipboardList, Clock, Flame, CheckCircle2 } from 'lucide-react'

const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: Clock },
    preparing: { label: 'Preparando', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: Flame },
    ready: { label: 'Listo ✓', color: 'bg-green-50 border-green-300', badge: 'bg-green-100 text-green-700', icon: CheckCircle2 },
}

export default function MisPedidosPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { user } = useAuth()

    const loadOrders = useCallback(async () => {
        if (!user) return
        try {
            // Fetch all orders by this waiter (server filters by waiterId),
            // then locally filter active statuses as a robust safety net.
            const res = await api.getOrders({ waiterId: user._id, limit: 200 })
            const all: Order[] = res.data.data?.orders ?? res.data.data ?? []
            const active = all.filter(o => ['pending', 'preparing', 'ready'].includes(o.status))
            setOrders(active)
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        loadOrders()

        // Real-time updates
        const socket: Socket = io(WS_URL, { transports: ['websocket', 'polling'] })
        socket.on('order:status_changed', loadOrders)
        socket.on('order:updated', loadOrders)
        return () => { socket.disconnect() }
    }, [loadOrders])

    const activeOrders = orders.filter(o =>
        ['pending', 'preparing', 'ready'].includes(o.status)
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
        )
    }

    if (activeOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-8">
                <ClipboardList className="w-14 h-14 text-gray-200" />
                <p className="font-semibold text-gray-600">Sin pedidos activos</p>
                <p className="text-sm text-gray-400">Los pedidos que generes aparecerán aquí</p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">Mis Pedidos</h2>
                <p className="text-sm text-gray-500">{activeOrders.length} pedido{activeOrders.length !== 1 ? 's' : ''} activo{activeOrders.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeOrders.map(order => {
                    const cfg = statusConfig[order.status as keyof typeof statusConfig]
                    if (!cfg) return null
                    const Icon = cfg.icon
                    return (
                        <div key={order._id} className={cn('rounded-2xl border-2 p-4 flex flex-col', cfg.color)}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{order.orderNumber}</p>
                                    <p className="text-xs text-gray-500">Mesa #{order.table?.number}</p>
                                </div>
                                <span className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', cfg.badge)}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {cfg.label}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4 flex-grow">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm text-gray-700">
                                        <span>{item.quantity}× {item.product?.name ?? 'Producto'}</span>
                                        <span className="text-gray-500 font-medium">{formatCurrency(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-black/10 mt-auto">
                                <span className="text-xs text-gray-500 font-medium">
                                    {new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
