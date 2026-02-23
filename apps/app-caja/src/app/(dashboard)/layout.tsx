'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, Home, Receipt, History, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Órdenes', href: '/orders', icon: Receipt },
    { name: 'Historial', href: '/history', icon: History },
    { name: 'Configuración', href: '/settings', icon: Settings },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, logout } = useAuth()
    const pathname = usePathname()

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200">
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="p-6 border-b border-gray-200">
                            <h1 className="text-2xl font-bold text-primary">Sistema de Caja</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                {user?.name}
                            </p>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Logout */}
                        <div className="p-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => logout()}
                            >
                                <LogOut className="h-5 w-5 mr-3" />
                                Cerrar Sesión
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}
