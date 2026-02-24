'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Clock, ChefHat, CheckCircle2, LogOut } from 'lucide-react'

// Define interfaces roughly based on the backend scheme
interface OrderItem {
    product: { name: string; _id: string; price: number; image?: string };
    quantity: number;
    notes: string;
}

interface Order {
    _id: string;
    tableId: string;
    status: 'pending' | 'preparing' | 'ready' | 'closed' | 'paid' | 'cancelled';
    items: OrderItem[];
    notes: string;
    createdAt: string;
}

// Variables from environment or defaults (Docker build args support NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100'
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'

export default function CocinaPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Simple auth check on load
        if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
            router.push('/login')
        }
    }, [router])

    const fetchOrders = async () => {
        try {
            // Fetch recent active orders. Waiter app uses the same API endpoints without authentication for now, or auth checks need bypassed here.
            // But if there's an auth layer we might need a token. We'll try without first, else we rely solely on websockets + mock.
            // Since this is the kitchen dashboard, often it's protected. If it fails due to 401, we'd need to login first.
            // Let's assume it allows fetching or we just fetch and catch silently.
            const res = await axios.get(`${API_URL}/api/orders?limit=100&sort=createdAt`, {
                // If the app requires token, we'd check localStorage here, but cocina app doesn't have an auth module built yet. 
                // We will send credentials if present.
                headers: {
                    Authorization: typeof window !== 'undefined' && localStorage.getItem('token')
                        ? `Bearer ${localStorage.getItem('token')}`
                        : ''
                }
            })
            const data = res.data?.data?.orders || []
            setOrders(data)
        } catch (error: any) {
            console.error('Error fetching orders:', error)
            if (error?.response?.status === 401) {
                if (typeof window !== 'undefined') localStorage.removeItem('token')
                router.push('/login')
            }
        }
    }

    useEffect(() => {
        fetchOrders()

        const newSocket = io(WS_URL, {
            transports: ['websocket', 'polling']
        })

        newSocket.on('connect', () => {
            setIsConnected(true)
            newSocket.emit('join:room', { role: 'kitchen' })
        })

        newSocket.on('disconnect', () => setIsConnected(false))

        newSocket.on('order:created', (newOrder: Order) => {
            setOrders(prev => {
                if (prev.find(o => o._id === newOrder._id)) return prev;
                return [...prev, newOrder]
            })
        })

        newSocket.on('order:status_changed', (updatedOrder: Order) => {
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o))
        })

        newSocket.on('order:update', (updatedOrder: Order) => {
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o))
        })

        setSocket(newSocket)

        return () => {
            newSocket.close()
        }
    }, [])

    const changeOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await axios.patch(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus }, {
                headers: {
                    Authorization: typeof window !== 'undefined' && localStorage.getItem('token')
                        ? `Bearer ${localStorage.getItem('token')}`
                        : ''
                }
            })
            // Update locally to be more responsive (will be synced via ws anyway)
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus as any } : o))
        } catch (error: any) {
            console.error('Error changing order status:', error)
            if (error?.response?.status === 401) {
                if (typeof window !== 'undefined') localStorage.removeItem('token')
                router.push('/login')
            } else {
                alert('No se pudo actualizar el estado de la orden.')
            }
        }
    }

    // Filter active orders
    const pendingOrders = orders.filter(o => o.status === 'pending')
    const preparingOrders = orders.filter(o => o.status === 'preparing')
    // Hide ready orders where all items have already been delivered to the table
    const readyOrders = orders.filter(o =>
        o.status === 'ready' &&
        !o.items.every((item: any) => item.status === 'delivered')
    )

    const OrderCard = ({ order, nextStatus, nextLabel, icon: Icon, color }: any) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="font-bold text-gray-800">Orden #{order._id.slice(-4)}</span>
                </div>
                <span className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                </span>
            </div>

            <div className="space-y-2">
                {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{item.quantity}x {item.product?.name}</span>
                        {item.notes && <span className="text-xs text-orange-600 italic ml-2">{item.notes}</span>}
                    </div>
                ))}
            </div>

            {order.notes && (
                <div className="text-sm bg-gray-50 p-2 rounded text-gray-600 border border-gray-100 mt-2">
                    <strong>Nota g.:</strong> {order.notes}
                </div>
            )}

            {nextStatus && (
                <button
                    onClick={() => changeOrderStatus(order._id, nextStatus)}
                    className="mt-3 w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm"
                >
                    {nextLabel}
                </button>
            )}
        </div>
    )

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.push('/login')
        }
    }

    return (
        <main className="min-h-screen p-6 bg-gray-50 text-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <ChefHat className="w-8 h-8 text-orange-500" />
                            Pantalla de Cocina
                        </h1>
                        <p className="text-gray-500 mt-1">Gestión de pedidos en tiempo real</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pendientes */}
                    <div className="bg-gray-100/50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-500" />
                                Pendientes
                            </h2>
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-bold">
                                {pendingOrders.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {pendingOrders.map(order => (
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    nextStatus="preparing"
                                    nextLabel="Comenzar a Preparar"
                                    icon={Clock}
                                    color="text-gray-500"
                                />
                            ))}
                        </div>
                    </div>

                    {/* En Preparación */}
                    <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-orange-700 flex items-center gap-2">
                                <ChefHat className="w-5 h-5 text-orange-500" />
                                En Preparación
                            </h2>
                            <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-md text-xs font-bold">
                                {preparingOrders.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {preparingOrders.map(order => (
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    nextStatus="ready"
                                    nextLabel="Marcar como Listo"
                                    icon={ChefHat}
                                    color="text-orange-500"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Listos */}
                    <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-green-700 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Listos
                            </h2>
                            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-md text-xs font-bold">
                                {readyOrders.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {readyOrders.map(order => (
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    icon={CheckCircle2}
                                    color="text-green-500"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
