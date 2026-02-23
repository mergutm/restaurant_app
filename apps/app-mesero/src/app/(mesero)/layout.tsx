'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutGrid, UtensilsCrossed, ClipboardList, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/mesas', label: 'Mesas', icon: LayoutGrid },
    { href: '/menu', label: 'Menú', icon: UtensilsCrossed },
    { href: '/mis-pedidos', label: 'Pedidos', icon: ClipboardList },
]

export default function MeseroLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth()
    const pathname = usePathname()

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50 flex-1 w-full mx-auto relative">
                {/* Top bar */}
                <header className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Mesero App</h1>
                        <p className="text-orange-100 text-xs">{user?.name}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 rounded-lg hover:bg-orange-600 transition-colors"
                        aria-label="Cerrar sesión"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto pb-20">
                    {children}
                </main>

                {/* Bottom navigation */}
                <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex z-50">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname.startsWith(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                                    active ? 'text-orange-500' : 'text-gray-400'
                                )}
                            >
                                <Icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
                                {label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </ProtectedRoute>
    )
}
