import { API_URL } from './constants'
import type {
    LoginCredentials,
    LoginResponse,
    User,
    Order,
    DashboardStats,
    ApiResponse
} from '@/types'

class ApiClient {
    private baseURL: string
    private token: string | null = null

    constructor(baseURL: string = API_URL) {
        this.baseURL = baseURL

        // Load token from localStorage if available
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token')
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>)
        }

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`
        }

        const response = await fetch(url, {
            ...options,
            headers
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición')
        }

        return data
    }

    setToken(token: string) {
        this.token = token
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token)
        }
    }

    clearToken() {
        this.token = null
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
        }
    }

    // Auth
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await this.request<LoginResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        })

        if (response.data?.token) {
            this.setToken(response.data.token)
        }

        return response
    }

    async getMe(): Promise<ApiResponse<{ user: User }>> {
        return this.request<ApiResponse<{ user: User }>>('/api/auth/me')
    }

    async logout(): Promise<void> {
        await this.request('/api/auth/logout', { method: 'POST' })
        this.clearToken()
    }

    // Orders
    async getOrders(params?: {
        status?: string
        tableId?: string
        waiterId?: string
        date?: string
        limit?: number
        page?: number
    }): Promise<ApiResponse<{ orders: Order[] }>> {
        const queryParams = new URLSearchParams()

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, String(value))
                }
            })
        }

        const query = queryParams.toString()
        const endpoint = `/api/orders${query ? `?${query}` : ''}`

        return this.request<ApiResponse<{ orders: Order[] }>>(endpoint)
    }

    async getOrder(id: string): Promise<ApiResponse<{ order: Order }>> {
        return this.request<ApiResponse<{ order: Order }>>(`/api/orders/${id}`)
    }

    async payOrder(
        id: string,
        paymentMethod: 'cash' | 'card' | 'transfer'
    ): Promise<ApiResponse<{ order: Order }>> {
        return this.request<ApiResponse<{ order: Order }>>(`/api/orders/${id}/pay`, {
            method: 'POST',
            body: JSON.stringify({ paymentMethod })
        })
    }

    // Dashboard
    async getStats(): Promise<ApiResponse<DashboardStats>> {
        return this.request<ApiResponse<DashboardStats>>('/api/dashboard/stats')
    }

    async getSales(params?: {
        startDate?: string
        endDate?: string
        groupBy?: 'day' | 'week' | 'month'
    }): Promise<ApiResponse<any>> {
        const queryParams = new URLSearchParams()

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, String(value))
                }
            })
        }

        const query = queryParams.toString()
        const endpoint = `/api/dashboard/sales${query ? `?${query}` : ''}`

        return this.request<ApiResponse<any>>(endpoint)
    }
}

export const api = new ApiClient()
