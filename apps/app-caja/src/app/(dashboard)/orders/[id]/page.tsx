'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants'
import { ArrowLeft, CreditCard } from 'lucide-react'
import type { Order } from '@/types'
import PaymentModal from '@/components/orders/PaymentModal'

export default function OrderDetailPage() {
    const [order, setOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const router = useRouter()
    const params = useParams()
    const orderId = params.id as string

    useEffect(() => {
        loadOrder()
    }, [orderId])

    const loadOrder = async () => {
        try {
            setIsLoading(true)
            const response = await api.getOrder(orderId)

            if (response.data?.order) {
                setOrder(response.data.order)
            }
        } catch (error) {
            console.error('Error loading order:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false)
        router.push('/orders')
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
                    <p className="text-muted-foreground">Cargando orden...</p>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Orden no encontrada</p>
                <Button onClick={() => router.push('/orders')} className="mt-4">
                    Volver a Órdenes
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push('/orders')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
                        <p className="text-muted-foreground mt-1">
                            {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>
                <Badge variant={getStatusBadgeVariant(order.status)} className="text-lg px-4 py-2">
                    {ORDER_STATUS_LABELS[order.status]}
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Order Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Información de la Orden</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Mesa</p>
                                <p className="text-lg font-semibold">#{order.table.number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Mesero</p>
                                <p className="text-lg font-semibold">{order.waiter.name}</p>
                            </div>
                            {order.paymentMethod && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Método de Pago</p>
                                    <p className="text-lg font-semibold">
                                        {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                                    </p>
                                </div>
                            )}
                            {order.paidAt && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Pagado</p>
                                    <p className="text-lg font-semibold">{formatDate(order.paidAt)}</p>
                                </div>
                            )}
                        </div>
                        {order.notes && (
                            <div>
                                <p className="text-sm text-muted-foreground">Notas</p>
                                <p className="mt-1">{order.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">IVA (16%)</span>
                            <span className="font-semibold">{formatCurrency(order.tax)}</span>
                        </div>
                        <div className="border-t pt-3">
                            <div className="flex justify-between">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-2xl font-bold text-primary">
                                    {formatCurrency(order.total)}
                                </span>
                            </div>
                        </div>
                        {order.status !== 'paid' && (
                            <Button
                                className="w-full mt-4"
                                size="lg"
                                onClick={() => setShowPaymentModal(true)}
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Procesar Pago
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Items de la Orden</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {order.items.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatCurrency(item.price)} × {item.quantity}
                                    </p>
                                    {item.notes && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Nota: {item.notes}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">{formatCurrency(item.subtotal)}</p>
                                    <Badge variant="secondary" className="mt-1">
                                        {ORDER_STATUS_LABELS[item.status]}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    order={order}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    )
}
