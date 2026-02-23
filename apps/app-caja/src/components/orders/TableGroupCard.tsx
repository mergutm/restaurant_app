'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { CreditCard, Eye, MapPin, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Order } from '@/types'
import PaymentModal from './PaymentModal'
import BulkPaymentModal from './BulkPaymentModal'

interface TableGroupCardProps {
    tableNumber: number
    tableId: string
    orders: Order[]
    onPaymentSuccess: () => void
}

const statusVariantMap: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'destructive'> = {
    ready: 'success',
    closed: 'secondary',
    paid: 'outline',
}

export default function TableGroupCard({ tableNumber, tableId, orders, onPaymentSuccess }: TableGroupCardProps) {
    const router = useRouter()
    const [singleOrderToPay, setSingleOrderToPay] = useState<Order | null>(null)
    const [showBulkModal, setShowBulkModal] = useState(false)

    const unpaidOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled')
    const tableTotal = unpaidOrders.reduce((sum, o) => sum + o.total, 0)
    const allPaid = unpaidOrders.length === 0

    // Get the waiter name from first order
    const waiterName = orders[0]?.waiter?.name ?? '—'

    return (
        <>
            <Card className={`flex flex-col transition-shadow hover:shadow-md ${allPaid ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-xl">Mesa #{tableNumber}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">{waiterName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{formatCurrency(tableTotal)}</p>
                            <p className="text-xs text-muted-foreground">{unpaidOrders.length} orden{unpaidOrders.length !== 1 ? 'es' : ''} pendiente{unpaidOrders.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-3">
                    {/* Individual orders */}
                    <div className="space-y-2">
                        {orders.map(order => (
                            <div
                                key={order._id}
                                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold truncate">{order.orderNumber}</p>
                                        <Badge variant={statusVariantMap[order.status] ?? 'default'} className="shrink-0">
                                            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                                </div>
                                <div className="flex items-center gap-2 ml-2 shrink-0">
                                    <span className="text-sm font-bold">{formatCurrency(order.total)}</span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => router.push(`/orders/${order._id}`)}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                    {order.status !== 'paid' && order.status !== 'cancelled' && (
                                        <Button
                                            size="sm"
                                            onClick={() => setSingleOrderToPay(order)}
                                        >
                                            <CreditCard className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pay all button */}
                    {unpaidOrders.length > 1 && (
                        <Button
                            className="w-full mt-auto"
                            size="lg"
                            onClick={() => setShowBulkModal(true)}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pagar toda la cuenta — {formatCurrency(tableTotal)}
                        </Button>
                    )}
                    {unpaidOrders.length === 1 && (
                        <Button
                            className="w-full mt-auto"
                            size="lg"
                            onClick={() => setSingleOrderToPay(unpaidOrders[0])}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pagar — {formatCurrency(tableTotal)}
                        </Button>
                    )}
                    {allPaid && (
                        <div className="w-full text-center text-sm text-muted-foreground py-2">
                            ✓ Pagado
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Single order payment modal */}
            {singleOrderToPay && (
                <PaymentModal
                    order={singleOrderToPay}
                    onClose={() => setSingleOrderToPay(null)}
                    onSuccess={() => {
                        setSingleOrderToPay(null)
                        onPaymentSuccess()
                    }}
                />
            )}

            {/* Bulk payment modal */}
            {showBulkModal && (
                <BulkPaymentModal
                    tableNumber={tableNumber}
                    orders={unpaidOrders}
                    onClose={() => setShowBulkModal(false)}
                    onSuccess={() => {
                        setShowBulkModal(false)
                        onPaymentSuccess()
                    }}
                />
            )}
        </>
    )
}
