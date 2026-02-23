'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import type { DashboardStats, Order } from '@/types'

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [activeOrders, setActiveOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [statsResponse, ordersResponse] = await Promise.all([
                api.getStats(),
                api.getOrders({ status: 'ready,closed', limit: 10 })
            ])

            if (statsResponse.data) {
                setStats(statsResponse.data)
            }

            if (ordersResponse.data?.orders) {
                setActiveOrders(ordersResponse.data.orders)
            }
        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Resumen de ventas y órdenes del día
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Ventas del Día
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats?.today.revenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.today.completedOrders || 0} órdenes completadas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Órdenes
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.today.totalOrders || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.today.activeOrders || 0} activas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Ticket Promedio
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats?.today.averageTicket || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Por orden
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Meseros Activos
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.topWaiters?.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Trabajando hoy
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Órdenes Pendientes de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                    {activeOrders.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No hay órdenes pendientes
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {activeOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold">{order.orderNumber}</p>
                                            <Badge variant={order.status === 'ready' ? 'success' : 'secondary'}>
                                                {order.status === 'ready' ? 'Listo' : 'Cerrado'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Mesa {order.table.number} • {order.waiter.name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">
                                            {formatCurrency(order.total)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.items.length} items
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
