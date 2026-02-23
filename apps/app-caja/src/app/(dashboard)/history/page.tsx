'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import { Search, Calendar, DollarSign, Receipt } from 'lucide-react'
import type { Order } from '@/types'

export default function HistoryPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageTicket: 0
    })

    useEffect(() => {
        loadHistory()
    }, [])

    useEffect(() => {
        filterOrders()
        calculateStats()
    }, [searchTerm, orders])

    const loadHistory = async () => {
        try {
            setIsLoading(true)
            const response = await api.getOrders({
                status: 'paid',
                limit: 100
            })

            if (response.data?.orders) {
                setOrders(response.data.orders)
            }
        } catch (error) {
            console.error('Error loading history:', error)
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

    const calculateStats = () => {
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
        const totalOrders = filteredOrders.length
        const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

        setStats({ totalRevenue, totalOrders, averageTicket })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando historial...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Historial de Ventas</h1>
                <p className="text-muted-foreground mt-1">
                    Consulta las órdenes pagadas
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Vendido
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.totalRevenue)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Órdenes Pagadas
                        </CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalOrders}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Ticket Promedio
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.averageTicket)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por número de orden, mesa o mesero..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            <Card>
                <CardHeader>
                    <CardTitle>Órdenes Pagadas</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredOrders.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No se encontraron órdenes pagadas
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="font-semibold">{order.orderNumber}</p>
                                            {order.paymentMethod && (
                                                <Badge variant="outline">
                                                    {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                            <div>
                                                <p>Mesa: <span className="font-medium text-foreground">#{order.table.number}</span></p>
                                                <p>Mesero: <span className="font-medium text-foreground">{order.waiter.name}</span></p>
                                            </div>
                                            <div>
                                                <p>Items: <span className="font-medium text-foreground">{order.items.length}</span></p>
                                                <p>Pagado: <span className="font-medium text-foreground">{formatDate(order.paidAt!)}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold">{formatCurrency(order.total)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            IVA: {formatCurrency(order.tax)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
