export interface User {
    _id: string
    username: string
    name: string
    role: 'cashier' | 'waiter' | 'kitchen' | 'admin'
    active: boolean
}

export interface Table {
    _id: string
    number: number
    capacity: number
    status: 'available' | 'occupied' | 'reserved' | 'cleaning'
    location: 'indoor' | 'outdoor' | 'terrace' | 'bar'
    active: boolean
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
    category?: { _id: string; name: string }
    image: string
    ingredients: string[]
    available: boolean
    preparationTime: number
}

export interface OrderItem {
    productId: string
    product?: { _id: string; name: string; price: number; image: string }
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
    table: { _id: string; number: number }
    waiterId: string
    waiter: { _id: string; name: string }
    items: OrderItem[]
    subtotal: number
    tax: number
    total: number
    status: 'pending' | 'preparing' | 'ready' | 'closed' | 'paid' | 'cancelled'
    notes?: string
    createdAt: string
    updatedAt: string
}

// Cart types (local state only)
export interface CartItem {
    product: Product
    quantity: number
    notes: string
}
