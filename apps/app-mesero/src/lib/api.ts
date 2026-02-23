import axios from 'axios'
import { API_URL, TOKEN_KEY } from './constants'

const apiClient = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Inject JWT on every request
apiClient.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined'
        ? localStorage.getItem(TOKEN_KEY)
        : null
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Auth
export const api = {
    login: (username: string, password: string) =>
        apiClient.post('/api/auth/login', { username, password }),

    me: () => apiClient.get('/api/auth/me'),

    // Tables
    getTables: () => apiClient.get('/api/tables'),

    // Categories
    getCategories: () => apiClient.get('/api/categories'),

    // Products
    getProducts: (params?: Record<string, string>) =>
        apiClient.get('/api/products', { params }),

    // Orders
    getOrders: (params?: Record<string, unknown>) =>
        apiClient.get('/api/orders', { params }),

    getOrder: (id: string) => apiClient.get(`/api/orders/${id}`),

    createOrder: (data: {
        tableId: string
        items: { productId: string; quantity: number; price: number; subtotal: number; notes?: string }[]
    }) => apiClient.post('/api/orders', data),

    addOrderItems: (id: string, items: {
        productId: string; quantity: number; price: number; subtotal: number; notes?: string
    }[]) => apiClient.post(`/api/orders/${id}/items`, { items }),

    updateOrderStatus: (id: string, status: string) =>
        apiClient.patch(`/api/orders/${id}/status`, { status }),
}
