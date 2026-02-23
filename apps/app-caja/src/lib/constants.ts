export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100'

export const ORDER_STATUS = {
    PENDING: 'pending',
    PREPARING: 'preparing',
    READY: 'ready',
    CLOSED: 'closed',
    PAID: 'paid',
    CANCELLED: 'cancelled'
} as const

export const ORDER_STATUS_LABELS = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    closed: 'Cerrado',
    paid: 'Pagado',
    cancelled: 'Cancelado'
} as const

export const PAYMENT_METHODS = {
    CASH: 'cash',
    CARD: 'card',
    TRANSFER: 'transfer'
} as const

export const PAYMENT_METHOD_LABELS = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia'
} as const

export const USER_ROLES = {
    ADMIN: 'admin',
    CASHIER: 'cashier',
    WAITER: 'waiter',
    KITCHEN: 'kitchen'
} as const
