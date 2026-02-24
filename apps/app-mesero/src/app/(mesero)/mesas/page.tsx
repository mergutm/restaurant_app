'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { Table, Order } from '@/types'
import { cn, formatCurrency } from '@/lib/utils'
import {
    Users, MapPin, X, Clock, Flame, CheckCircle2,
    PackageCheck, AlertCircle, ShoppingBag, Plus, Truck
} from 'lucide-react'

// ─── Status helpers ────────────────────────────────────────────────────────────

const tableStatusConfig = {
    available: { label: 'Disponible', color: 'bg-green-50 border-green-300 text-green-700', dot: 'bg-green-500' },
    occupied: { label: 'Ocupada', color: 'bg-orange-50 border-orange-300 text-orange-700', dot: 'bg-orange-500' },
    reserved: { label: 'Reservada', color: 'bg-blue-50 border-blue-300 text-blue-700', dot: 'bg-blue-500' },
    cleaning: { label: 'Limpieza', color: 'bg-gray-50 border-gray-300 text-gray-500', dot: 'bg-gray-400' },
}

const orderStatusConfig = {
    pending: { label: 'Pendiente', badge: 'bg-yellow-100 text-yellow-700', icon: Clock },
    preparing: { label: 'Preparando', badge: 'bg-blue-100 text-blue-700', icon: Flame },
    ready: { label: 'Listo', badge: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    closed: { label: 'Cerrado', badge: 'bg-gray-100 text-gray-600', icon: PackageCheck },
    paid: { label: 'Pagado', badge: 'bg-teal-100 text-teal-700', icon: PackageCheck },
    cancelled: { label: 'Cancelado', badge: 'bg-red-100 text-red-600', icon: AlertCircle },
}

const itemStatusConfig = {
    pending: { label: 'Pendiente', badge: 'bg-yellow-100 text-yellow-700' },
    preparing: { label: 'Preparando', badge: 'bg-blue-100 text-blue-700' },
    ready: { label: 'Listo', badge: 'bg-green-100 text-green-700' },
    delivered: { label: 'Entregado', badge: 'bg-teal-100 text-teal-700' },
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function MesasPage() {
    const [tables, setTables] = useState<Table[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [tableOrders, setTableOrders] = useState<Order[]>([])
    const [ordersLoading, setOrdersLoading] = useState(false)
    const [deliveringItem, setDeliveringItem] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        api.getTables()
            .then(res => setTables(res.data.data?.tables ?? res.data.data ?? []))
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    const handleTableClick = async (table: Table) => {
        if (table.status === 'available') {
            router.push(`/pedido/${table._id}`)
            return
        }

        // For occupied / reserved tables → load orders and open modal
        if (table.status === 'occupied' || table.status === 'reserved') {
            setSelectedTable(table)
            setOrdersLoading(true)
            try {
                const res = await api.getOrders({ tableId: table._id })
                const orders: Order[] = res.data.data?.orders ?? res.data.data ?? []
                // Only show active (non-paid, non-cancelled) orders
                const visible = orders.filter(o => !['paid', 'cancelled'].includes(o.status))
                const active = visible.filter(o => ['pending', 'preparing', 'ready'].includes(o.status))
                const other = visible.filter(o => ['closed'].includes(o.status))
                setTableOrders([...active, ...other])
            } catch (e) {
                console.error(e)
            } finally {
                setOrdersLoading(false)
            }
        }
    }

    const deliverItem = useCallback(async (orderId: string, itemId: string) => {
        setDeliveringItem(itemId)
        try {
            await api.markItemDelivered(orderId, itemId)
            // Refresh orders for this table
            if (selectedTable) {
                const res = await api.getOrders({ tableId: selectedTable._id })
                const orders: Order[] = res.data.data?.orders ?? res.data.data ?? []
                const visible = orders.filter(o => !['paid', 'cancelled'].includes(o.status))
                const active = visible.filter(o => ['pending', 'preparing', 'ready'].includes(o.status))
                const other = visible.filter(o => ['closed'].includes(o.status))
                setTableOrders([...active, ...other])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setDeliveringItem(null)
        }
    }, [selectedTable])

    const closeModal = () => {
        setSelectedTable(null)
        setTableOrders([])
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">Mesas</h2>
                <p className="text-sm text-gray-500">Toca una mesa para ver sus pedidos o iniciar uno nuevo</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.filter(t => t.active).map(table => {
                    const cfg = tableStatusConfig[table.status] ?? tableStatusConfig.available
                    const clickable = table.status === 'available' || table.status === 'occupied' || table.status === 'reserved'
                    return (
                        <button
                            key={table._id}
                            onClick={() => clickable && handleTableClick(table)}
                            disabled={!clickable}
                            className={cn(
                                'relative rounded-2xl border-2 p-4 text-left transition-all active:scale-95',
                                cfg.color,
                                clickable ? 'cursor-pointer shadow-sm hover:shadow-md' : 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl font-bold">#{table.number}</span>
                                <span className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                            </div>
                            <div className="flex items-center gap-1 text-xs mb-1">
                                <Users className="w-3 h-3" />
                                <span>{table.capacity} personas</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                                <MapPin className="w-3 h-3" />
                                <span className="capitalize">{table.location}</span>
                            </div>
                            <div className="mt-2">
                                <span className="text-xs font-medium">{cfg.label}</span>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* ── Order Detail Modal ── */}
            {selectedTable && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="w-full max-h-[85vh] bg-white rounded-t-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Mesa #{selectedTable.number}
                                </h3>
                                <p className="text-sm text-gray-500 capitalize">
                                    {selectedTable.location} · {selectedTable.capacity} personas
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Quick action: add new order to this table */}
                                <button
                                    onClick={() => router.push(`/pedido/${selectedTable._id}`)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Nuevo pedido</span>
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-xl hover:bg-gray-100 transition"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Modal body */}
                        <div className="overflow-y-auto flex-1 p-4">
                            {ordersLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                                </div>
                            ) : tableOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                                    <ShoppingBag className="w-12 h-12 text-gray-200" />
                                    <p className="text-gray-500 font-medium">Sin pedidos registrados</p>
                                    <p className="text-sm text-gray-400">Esta mesa no tiene órdenes aún</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tableOrders.map(order => {
                                        const osCfg = orderStatusConfig[order.status] ?? orderStatusConfig.pending
                                        const OsIcon = osCfg.icon
                                        return (
                                            <div key={order._id} className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                                                {/* Order header */}
                                                <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{order.orderNumber}</p>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <span className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', osCfg.badge)}>
                                                        <OsIcon className="w-3.5 h-3.5" />
                                                        {osCfg.label}
                                                    </span>
                                                </div>

                                                {/* Items with per-item status + deliver button */}
                                                <div className="p-4 space-y-3">
                                                    {order.items.map((item, idx) => {
                                                        const itemId = (item as any)._id as string
                                                        const itemStatus = item.status ?? 'pending'
                                                        const isCfg = itemStatusConfig[itemStatus] ?? itemStatusConfig.pending
                                                        // Show deliver button when ORDER is ready AND this item hasn't been delivered yet.
                                                        // (Kitchen marks the order as ready, not individual items.)
                                                        const canDeliver = order.status === 'ready' && itemStatus !== 'delivered'
                                                        const isDelivering = deliveringItem === itemId
                                                        return (
                                                            <div key={idx} className="flex items-start gap-3">
                                                                <img
                                                                    src={item.product?.image ?? '/placeholder.png'}
                                                                    alt={item.product?.name ?? 'Producto'}
                                                                    className="w-10 h-10 rounded-lg object-cover bg-gray-200 shrink-0"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                                        {item.quantity}× {item.product?.name ?? 'Producto'}
                                                                    </p>
                                                                    {item.notes && (
                                                                        <p className="text-xs text-gray-400 italic truncate">{item.notes}</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', isCfg.badge)}>
                                                                        {isCfg.label}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">{formatCurrency(item.subtotal)}</span>
                                                                    {canDeliver && itemId && (
                                                                        <button
                                                                            onClick={() => deliverItem(order._id, itemId)}
                                                                            disabled={isDelivering}
                                                                            className="flex items-center gap-1 text-xs px-2 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition disabled:opacity-50"
                                                                        >
                                                                            {isDelivering
                                                                                ? <span>...</span>
                                                                                : <><Truck className="w-3 h-3" /><span>Entregar</span></>}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {/* Order footer total */}
                                                <div className="flex justify-between items-center px-4 py-3 bg-white border-t">
                                                    <span className="text-sm text-gray-500">Total (con IVA)</span>
                                                    <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
