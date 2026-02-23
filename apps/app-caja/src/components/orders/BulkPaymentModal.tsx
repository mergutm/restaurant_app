'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { X, CreditCard, Banknote, Smartphone, CheckCircle, Loader2 } from 'lucide-react'
import type { Order } from '@/types'

interface BulkPaymentModalProps {
    tableNumber: number
    orders: Order[]
    onClose: () => void
    onSuccess: () => void
}

const paymentMethods = [
    { id: 'cash' as const, label: 'Efectivo', icon: Banknote, color: 'bg-green-500' },
    { id: 'card' as const, label: 'Tarjeta', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'transfer' as const, label: 'Transferencia', icon: Smartphone, color: 'bg-purple-500' },
]

export default function BulkPaymentModal({ tableNumber, orders, onClose, onSuccess }: BulkPaymentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'transfer' | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const unpaidOrders = orders.filter(o => o.status !== 'paid')
    const total = unpaidOrders.reduce((sum, o) => sum + o.total, 0)
    const subtotal = unpaidOrders.reduce((sum, o) => sum + o.subtotal, 0)
    const tax = unpaidOrders.reduce((sum, o) => sum + o.tax, 0)

    const handlePayment = async () => {
        if (!selectedMethod) return
        setError('')
        setIsProcessing(true)
        try {
            // Pay all unpaid orders sequentially
            for (const order of unpaidOrders) {
                await api.payOrder(order._id, selectedMethod)
            }
            setSuccess(true)
            setTimeout(() => onSuccess(), 1500)
        } catch (err: any) {
            setError(err.message || 'Error al procesar el pago')
        } finally {
            setIsProcessing(false)
        }
    }

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-12 pb-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-green-500 p-4">
                                <CheckCircle className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">¡Cuenta Pagada!</h2>
                        <p className="text-muted-foreground">
                            Todas las órdenes de la Mesa #{tableNumber} han sido pagadas
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Pagar Cuenta — Mesa #{tableNumber}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={isProcessing}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Orders summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {unpaidOrders.map(order => (
                            <div key={order._id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{order.orderNumber} ({order.items.length} items)</span>
                                <span className="font-medium">{formatCurrency(order.total)}</span>
                            </div>
                        ))}
                        <div className="border-t pt-3 mt-3 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">IVA (16%)</span>
                                <span>{formatCurrency(tax)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-1">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment methods */}
                    <div>
                        <h3 className="font-semibold mb-3">Método de pago:</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    disabled={isProcessing}
                                    className={`relative p-6 rounded-lg border-2 transition-all ${selectedMethod === method.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className={`${method.color} p-3 rounded-full`}>
                                            <method.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="font-medium text-sm">{method.label}</span>
                                    </div>
                                    {selectedMethod === method.id && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={onClose} disabled={isProcessing}>
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handlePayment}
                            disabled={!selectedMethod || isProcessing}
                        >
                            {isProcessing ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Procesando...</>
                            ) : (
                                <>Confirmar Pago — {formatCurrency(total)}</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
