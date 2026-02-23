'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { formatCurrency, formatTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { Search, Eye } from 'lucide-react'
import type { Order } from '@/types'

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('ready,closed')
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        loadOrders()
    }, [statusFilter])

    useEffect(() => {
        filterOrders()
    }, [searchTerm, orders])

    const loadOrders = async () => {
        try {
            setIsLoading(true)
            const response = await api.getOrders({
                status: statusFilter,
                limit: 100
            })

            if (response.data?.orders) {
                setOrders(response.data.orders)
            }
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filterOrders = () => {
        if (!searchTerm) {
            setFilteredOrders(orders)
            return
        }

        const filtered = orders.filter(order =>
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.table.number.toString().includes(searchTerm) ||
            order.waiter.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredOrders(filtered)
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'ready':
                return 'success'
            case 'closed':
                return 'secondary'
            case 'paid':
                return 'outline'
            default:
                return 'default'
        }
    }

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
                <p className="text-muted-foreground mt-1">
                    Gestiona las órdenes pendientes de pago
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por número de orden, mesa o mesero..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === 'ready,closed' ? 'default' : 'outline'}
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

            {/* Orders List */}
            <div className="grid gap-4">
                {filteredOrders.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <p className="text-center text-muted-foreground">
                                No se encontraron órdenes
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredOrders.map((order) => (
                        <Card key={order._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                                            <Badge variant={getStatusBadgeVariant(order.status)}>
                                                {ORDER_STATUS_LABELS[order.status]}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                            <div>
                                                <p>Mesa: <span className="font-medium text-foreground">#{order.table.number}</span></p>
                                                <p>Mesero: <span className="font-medium text-foreground">{order.waiter.name}</span></p>
                                            </div>
                                            <div>
                                                <p>Items: <span className="font-medium text-foreground">{order.items.length}</span></p>
                                                <p>Hora: <span className="font-medium text-foreground">{formatTime(order.createdAt)}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{formatCurrency(order.total)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                IVA: {formatCurrency(order.tax)}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => router.push(`/orders/${order._id}`)}
                                            size="lg"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Ver Detalle
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
