'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { formatCurrency, formatTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { Search, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Order } from '@/types'
import TableGroupCard from '@/components/orders/TableGroupCard'

// Group orders by table, sorted by table number ascending
function groupByTable(orders: Order[]) {
    const map: Record<string, { tableId: string; tableNumber: number; orders: Order[] }> = {}
    for (const order of orders) {
        const key = order.table._id
        if (!map[key]) map[key] = { tableId: order.table._id, tableNumber: order.table.number, orders: [] }
        map[key].orders.push(order)
    }
    return Object.values(map).sort((a, b) => a.tableNumber - b.tableNumber)
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'success' | 'destructive' => {
    switch (status) {
        case 'ready': return 'success'
        case 'closed': return 'secondary'
        case 'paid': return 'outline'
        default: return 'default'
    }
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('ready,closed')
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        loadOrders()
    }, [statusFilter])

    const loadOrders = async () => {
        try {
            setIsLoading(true)
            const response = await api.getOrders({ status: statusFilter, limit: 200 })
            if (response.data?.orders) {
                setOrders(response.data.orders)
            }
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Apply text search
    const filtered = orders.filter(o => {
        if (!searchTerm) return true
        const q = searchTerm.toLowerCase()
        return (
            o.orderNumber.toLowerCase().includes(q) ||
            String(o.table.number).includes(q) ||
            o.waiter.name.toLowerCase().includes(q)
        )
    })

    const isPendingView = statusFilter === 'ready,closed'
    const tableGroups = groupByTable(filtered)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando órdenes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Órdenes</h1>
                <p className="text-muted-foreground mt-1">Gestiona las órdenes pendientes de pago</p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por orden, mesa o mesero..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button
                                variant={isPendingView ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('ready,closed')}
                            >
                                Pendientes
                            </Button>
                            <Button
                                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('paid')}
                            >
                                Pagadas
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Grouped table view (pending) */}
            {isPendingView && (
                <>
                    <p className="text-sm text-muted-foreground">
                        {tableGroups.length} mesa{tableGroups.length !== 1 ? 's' : ''} · {filtered.length} orden{filtered.length !== 1 ? 'es' : ''}
                    </p>
                    {tableGroups.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No se encontraron órdenes pendientes
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tableGroups.map(group => (
                                <TableGroupCard
                                    key={group.tableId}
                                    tableId={group.tableId}
                                    tableNumber={group.tableNumber}
                                    orders={group.orders}
                                    onPaymentSuccess={loadOrders}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Individual order view (paid history) */}
            {!isPendingView && (
                <>
                    <p className="text-sm text-muted-foreground">{filtered.length} orden{filtered.length !== 1 ? 'es' : ''}</p>
                    {filtered.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No se encontraron órdenes
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map(order => (
                                <Card key={order._id} className="hover:shadow-md transition-shadow flex flex-col">
                                    <CardContent className="p-5 flex flex-col flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold">{order.orderNumber}</h3>
                                                <p className="text-sm text-muted-foreground">Mesa #{order.table.number} · {order.waiter.name}</p>
                                            </div>
                                            <Badge variant={getStatusVariant(order.status)}>
                                                {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-4 flex-1">
                                            <p>{order.items.length} items · {formatTime(order.createdAt)}</p>
                                            <p>IVA: {formatCurrency(order.tax)}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <p className="text-xl font-bold">{formatCurrency(order.total)}</p>
                                            <Button size="sm" onClick={() => router.push(`/orders/${order._id}`)}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                Ver
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
