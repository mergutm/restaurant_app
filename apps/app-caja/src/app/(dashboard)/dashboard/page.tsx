'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import type { DashboardStats, Order } from '@/types'
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
                api.getOrders({ status: 'ready,closed', limit: 200 })
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

    const tableGroups = groupByTable(activeOrders)

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
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ventas del Día</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.today.revenue || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stats?.today.completedOrders || 0} órdenes completadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Órdenes</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.today.totalOrders || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stats?.today.activeOrders || 0} activas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.today.averageTicket || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Por orden</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Meseros Activos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.topWaiters?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Trabajando hoy</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending tables */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold">Mesas Pendientes de Pago</h2>
                        <p className="text-sm text-muted-foreground">{tableGroups.length} mesa{tableGroups.length !== 1 ? 's' : ''} con órdenes activas</p>
                    </div>
                </div>

                {tableGroups.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No hay órdenes pendientes de pago
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
                                onPaymentSuccess={loadData}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
