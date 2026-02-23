export interface User {
    _id: string
    username: string
    name: string
    role: 'admin' | 'cashier' | 'waiter' | 'kitchen'
    active: boolean
    createdAt: string
    updatedAt: string
}

export interface Category {
    _id: string
    name: string
    description?: string
    order: number
    active: boolean
}

export interface Product {
    _id: string
    name: string
    description?: string
    price: number
    categoryId: string
    category: {
        _id: string
        name: string
    }
    image?: string
    ingredients?: string[]
    available: boolean
    preparationTime: number
    createdAt: string
    updatedAt: string
}

export interface Table {
    _id: string
    number: number
    capacity: number
    status: 'available' | 'occupied' | 'reserved' | 'cleaning'
    location: 'indoor' | 'outdoor' | 'terrace' | 'bar'
    active: boolean
}

export interface OrderItem {
    _id: string
    productId: string
    product: {
        _id: string
        name: string
        price: number
        image?: string
    }
    quantity: number
    price: number
    subtotal: number
    notes?: string
    status: 'pending' | 'preparing' | 'ready' | 'delivered'
}

export interface Order {
    _id: string
    orderNumber: string
    tableId: string
    table: {
        _id: string
        number: number
    }
    waiterId: string
    waiter: {
        _id: string
        name: string
    }
    items: OrderItem[]
    subtotal: number
    tax: number
    total: number
    status: 'pending' | 'preparing' | 'ready' | 'closed' | 'paid' | 'cancelled'
    paymentMethod?: 'cash' | 'card' | 'transfer'
    notes?: string
    closedAt?: string
    paidAt?: string
    createdAt: string
    updatedAt: string
}

export interface DashboardStats {
    today: {
        totalOrders: number
        completedOrders: number
        activeOrders: number
        revenue: number
        averageTicket: number
    }
    ordersByStatus: Array<{
        _id: string
        count: number
    }>
    topProducts: Array<{
        product: {
            _id: string
            name: string
        }
        quantity: number
        revenue: number
    }>
    topWaiters: Array<{
        _id: string
        waiterName: string
        orders: number
        revenue: number
    }>
}

export interface LoginCredentials {
    username: string
    password: string
}

export interface LoginResponse {
    status: string
    data: {
        token: string
        user: User
    }
}

export interface ApiResponse<T> {
    status: 'success' | 'fail' | 'error'
    data?: T
    message?: string
    results?: number
    total?: number
    page?: number
    pages?: number
}
